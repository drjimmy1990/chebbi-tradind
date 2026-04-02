import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const status = searchParams.get("status");

    // Verify shared secret (same one used by n8n webhook)
    const secretSetting = await db.siteSetting.findUnique({
      where: { key: "webhookSecret" },
    });

    if (!secretSetting?.value || secretSetting.value !== secret) {
      return NextResponse.json(
        { error: "Unauthorized: invalid or missing secret" },
        { status: 401 }
      );
    }

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
  const session = requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { name, email, xmId, status = "pending" } = body;

    if (!name || !email || !xmId) {
      return NextResponse.json(
        { error: "Name, email, and xmId are required" },
        { status: 400 }
      );
    }

    const member = await db.member.create({
      data: { name, email, xmId, status },
    });

    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  // Auth guard
  const session = requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, status } = body;

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

    const member = await db.member.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ data: member });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}
