import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/webhook/member-status
 * 
 * Called by n8n to accept or reject a member.
 * 
 * Body: { memberId: string, status: "active" | "rejected", secret: string }
 * 
 * Security: Requires a shared secret that matches the "webhookSecret" SiteSetting.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, status, secret } = body;

    if (!memberId || !status || !secret) {
      return NextResponse.json(
        { error: "memberId, status, and secret are required" },
        { status: 400 }
      );
    }

    if (!["active", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'active' or 'rejected'" },
        { status: 400 }
      );
    }

    // Verify shared secret
    const secretSetting = await db.siteSetting.findUnique({
      where: { key: "webhookSecret" },
    });

    if (!secretSetting?.value || secretSetting.value !== secret) {
      return NextResponse.json(
        { error: "Invalid secret" },
        { status: 401 }
      );
    }

    // Update member status
    const member = await db.member.update({
      where: { id: memberId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: { id: member.id, name: member.name, status: member.status },
    });
  } catch (error) {
    console.error("Webhook member-status error:", error);
    return NextResponse.json(
      { error: "Failed to update member status" },
      { status: 500 }
    );
  }
}
