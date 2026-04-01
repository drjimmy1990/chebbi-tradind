import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const result = searchParams.get("result");

    const where: Record<string, unknown> = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);
    if (result) where.result = result;

    const data = await db.trade.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, contract, period, direction, entry, exit, pips, result, notes } = body;

    if (!contract || !direction || pips == null) {
      return NextResponse.json(
        { error: "contract, direction, and pips are required" },
        { status: 400 }
      );
    }

    const trade = await db.trade.create({
      data: {
        year: Number(year) || new Date().getFullYear(),
        month: Number(month) ?? new Date().getMonth(),
        contract: String(contract),
        period: String(period || ""),
        direction: String(direction),
        entry: Number(entry) || 0,
        exit: Number(exit) || 0,
        pips: Number(pips),
        result: String(result || "W"),
      },
    });

    return NextResponse.json({ data: trade }, { status: 201 });
  } catch (error) {
    console.error("Error creating trade:", error);
    return NextResponse.json({ error: "Failed to create trade" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.trade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trade:", error);
    return NextResponse.json({ error: "Failed to delete trade" }, { status: 500 });
  }
}
