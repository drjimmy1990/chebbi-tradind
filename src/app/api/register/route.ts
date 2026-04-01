import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Public endpoint — no auth required (users register themselves)
  try {
    const body = await request.json();
    const { name, email, xmId, proofFile } = body;

    if (!name || !email || !xmId) {
      return NextResponse.json(
        { error: "Name, email, and XM ID are required" },
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
        name: name.trim(),
        email: email.trim().toLowerCase(),
        xmId: xmId.trim(),
        proofFile: proofFile || null,
        status: "pending",
      },
    });

    // Fire webhook to n8n (non-blocking)
    fireWebhook(member).catch((err) =>
      console.error("Webhook fire failed (non-blocking):", err)
    );

    return NextResponse.json({
      data: member,
      message: "Registration successful! We will verify your XM account and activate your access.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering member:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

/** Send registration data to n8n webhook URL (fire-and-forget) */
async function fireWebhook(member: {
  id: string;
  name: string;
  email: string;
  xmId: string;
  proofFile?: string | null;
  createdAt: Date;
}) {
  try {
    // Read webhook URL from settings
    const setting = await db.siteSetting.findUnique({
      where: { key: "webhookRegister" },
    });

    if (!setting?.value) {
      console.log("No webhookRegister URL configured — skipping webhook.");
      return;
    }

    const webhookUrl = setting.value;

    // Build the full proof URL if proofFile exists
    const siteUrlSetting = await db.siteSetting.findUnique({
      where: { key: "siteUrl" },
    });
    const siteUrl = siteUrlSetting?.value || "https://chebbi-trading.com";
    const proofUrl = member.proofFile ? `${siteUrl}${member.proofFile}` : null;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new_registration",
        memberId: member.id,
        name: member.name,
        email: member.email,
        xmId: member.xmId,
        proofFile: proofUrl,
        createdAt: member.createdAt.toISOString(),
      }),
    });

    console.log(`Webhook sent for member ${member.id}`);
  } catch (err) {
    console.error("Webhook error:", err);
  }
}
