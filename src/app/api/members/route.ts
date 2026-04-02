import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const data = await db.member.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Auth guard
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { name, email, xmId, status = "pending", proofFile } = body;

    if (!name || !email || !xmId) {
      return NextResponse.json(
        { error: "Name, email, and xmId are required" },
        { status: 400 }
      );
    }

    const member = await db.member.create({
      data: { name, email, xmId, status, proofFile },
    });

    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  // Auth guard
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, status, proofFile } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    if (!["pending", "active", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "status must be pending, active, or rejected" },
        { status: 400 }
      );
    }

    const updateData: { status: string; proofFile?: string } = { status };
    if (proofFile) {
      updateData.proofFile = proofFile;
    }

    const member = await db.member.update({
      where: { id },
      data: updateData,
    });

    // Fire webhook if approved
    if (status === "active") {
      try {
        const setting = await db.siteSetting.findUnique({
          where: { key: "webhookRegister" }, // This is the webhook field in dashboard
        });

        if (setting?.value && setting.value.startsWith("http")) {
          const secretSetting = await db.siteSetting.findUnique({
            where: { key: "webhookSecret" },
          });
          const webhookSecret = secretSetting?.value || "";

          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (webhookSecret) {
            headers["Authorization"] = `Bearer ${webhookSecret}`;
            headers["x-webhook-secret"] = webhookSecret;
          }

          fetch(setting.value, {
            method: "POST",
            headers,
            body: JSON.stringify({
              event: "member_approved",
              id: member.id, // Internal database ID
              xmId: member.xmId, // Trading ID
              email: member.email,
            }),
          }).catch(err => console.error("Webhook approve failed:", err));
        }
      } catch (err) {
        console.error("Failed to read webhook setting", err);
      }
    }

    return NextResponse.json({ data: member });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Auth guard
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    await db.member.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
