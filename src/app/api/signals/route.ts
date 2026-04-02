import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const data = await db.signal.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Auth guard
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { instrument, direction, entry, takeProfit, stopLoss, result = "open", date } = body;

    if (!instrument || !direction || !entry) {
      return NextResponse.json(
        { error: "instrument, direction, and entry are required" },
        { status: 400 }
      );
    }

    const signal = await db.signal.create({
      data: { instrument, direction, entry, takeProfit, stopLoss, result, date },
    });

    return NextResponse.json({ data: signal }, { status: 201 });
  } catch (error) {
    console.error("Error creating signal:", error);
    return NextResponse.json({ error: "Failed to create signal" }, { status: 500 });
  }
}
