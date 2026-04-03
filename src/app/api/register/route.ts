import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Public endpoint — no auth required (users register themselves)
  try {
    const body = await request.json();
    const { name, email, xmId, proofBase64, proofFile, proofFilename, language } = body;

    if (!email || !xmId) {
      return NextResponse.json(
        { error: "Email and XM ID are required" },
        { status: 400 }
      );
    }

    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check for duplicate XM ID
    const existing = await db.member.findFirst({
      where: { xmId: xmId.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This XM ID is already registered. We will contact you shortly." },
        { status: 409 }
      );
    }

    const member = await db.member.create({
      data: {
        name: name ? name.trim() : `XM Trader ${xmId.trim()}`,
        email: email.trim().toLowerCase(),
        xmId: xmId.trim(),
        language: language || "fr",
        status: "pending",
        proofFile: null, // Will be updated with the public URL from n8n
      },
    });

    // Fire webhook to n8n and WAIT for the response (Synchronous verification)
    const webhookResponse = await fireWebhook(member, proofBase64, proofFilename, language);

    // If n8n responds with a failure (e.g. { "success": false, "message": "Not an affiliate" })
    if (webhookResponse && webhookResponse.success === false) {
      // Delete the pending member since they failed the immediate n8n verification
      await db.member.delete({ where: { id: member.id } });
      
      return NextResponse.json(
        { error: webhookResponse.message || "not_affiliate" },
        { status: 400 }
      );
    }

    // If n8n returned a public file URL for the proof image, update the member record
    if (webhookResponse && webhookResponse.proofUrl) {
      await db.member.update({
        where: { id: member.id },
        data: { proofFile: webhookResponse.proofUrl },
      });
    }

    return NextResponse.json({
      data: member,
      message: webhookResponse && webhookResponse.message ? webhookResponse.message : "Registration successful! We will verify your XM account and activate your access.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering member:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

/**
 * Send registration data to n8n webhook and wait for verification response.
 */
async function fireWebhook(
  member: { id: string; name: string; email: string; xmId: string; createdAt: Date },
  proofBase64?: string,
  proofFilename?: string,
  language?: string
) {
  try {
    // Read webhook URL from settings
    const setting = await db.siteSetting.findUnique({
      where: { key: "webhookRegister" },
    });

    if (!setting?.value) {
      console.log("No webhookRegister URL configured — skipping webhook.");
      return null;
    }

    const webhookUrl = setting.value;

    // Read webhook secret for authentication
    const secretSetting = await db.siteSetting.findUnique({
      where: { key: "webhookSecret" },
    });
    const webhookSecret = secretSetting?.value || "";

    // Read callback URL for n8n to use
    const siteUrlSetting = await db.siteSetting.findUnique({
      where: { key: "siteUrl" },
    });
    const siteUrl = siteUrlSetting?.value || "https://chebbi-trading.com";

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (webhookSecret) {
      headers["Authorization"] = `Bearer ${webhookSecret}`;
      headers["x-webhook-secret"] = webhookSecret;
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: "new_registration",
        memberId: member.id,
        name: member.name,
        email: member.email,
        xmId: member.xmId,
        language: language || "fr",
        createdAt: member.createdAt.toISOString(),
        // File data for n8n to save on VPS
        proofBase64: proofBase64 || null,
        proofFilename: proofFilename || null,
        // Callback info for n8n
        callbackUrl: `${siteUrl}/api/webhook/member-status`,
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data;
    }
    
    return null;
  } catch (err) {
    console.error("Webhook error:", err);
    return null;
  }
}
