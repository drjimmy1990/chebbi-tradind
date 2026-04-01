import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — returns all crypto monthly records grouped by year
export async function GET() {
  try {
    const data = await db.cryptoMonthly.findMany({
      orderBy: [{ year: "asc" }, { monthIndex: "asc" }],
    });

    const grouped: Record<string, typeof data> = {};
    for (const item of data) {
      const y = String(item.year);
      if (!grouped[y]) grouped[y] = [];
      grouped[y].push(item);
    }

    return NextResponse.json({ data: grouped, all: data });
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
  }
}

// POST — create a new crypto monthly record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, monthIndex, percentage } = body;

    if (year == null || monthIndex == null || percentage == null) {
      return NextResponse.json({ error: "year, monthIndex, and percentage are required" }, { status: 400 });
    }

    const record = await db.cryptoMonthly.upsert({
      where: { year_monthIndex: { year: Number(year), monthIndex: Number(monthIndex) } },
      update: { percentage: Number(percentage) },
      create: { year: Number(year), monthIndex: Number(monthIndex), percentage: Number(percentage) },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating crypto record:", error);
    return NextResponse.json({ error: "Failed to create crypto record" }, { status: 500 });
  }
}

// PUT — update a crypto monthly record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, year, monthIndex, percentage } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const record = await db.cryptoMonthly.update({
      where: { id },
      data: {
        ...(year != null && { year: Number(year) }),
        ...(monthIndex != null && { monthIndex: Number(monthIndex) }),
        ...(percentage != null && { percentage: Number(percentage) }),
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating crypto record:", error);
    return NextResponse.json({ error: "Failed to update crypto record" }, { status: 500 });
  }
}

// DELETE — remove a crypto monthly record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.cryptoMonthly.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting crypto record:", error);
    return NextResponse.json({ error: "Failed to delete crypto record" }, { status: 500 });
  }
}
