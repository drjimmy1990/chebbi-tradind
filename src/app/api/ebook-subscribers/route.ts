import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

// GET — list all ebook subscribers (admin only)
export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const subscribers = await db.ebookSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: subscribers });
  } catch (error) {
    console.error("Error fetching ebook subscribers:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

// POST — public: add a new ebook subscriber email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already exists
    const existing = await db.ebookSubscriber.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json({ message: "already_subscribed" });
    }

    const subscriber = await db.ebookSubscriber.create({
      data: { email: cleanEmail },
    });

    return NextResponse.json({ data: subscriber });
  } catch (error) {
    console.error("Error creating ebook subscriber:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

// DELETE — admin only: remove subscriber
export async function DELETE(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.ebookSubscriber.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ebook subscriber:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}

// PATCH — admin only: update subscriber status
export async function PATCH(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const subscriber = await db.ebookSubscriber.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ data: subscriber });
  } catch (error) {
    console.error("Error updating ebook subscriber:", error);
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }
}
