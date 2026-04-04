import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

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

// POST — create new crypto monthly record(s)
export async function POST(request: NextRequest) {
  try {
    // Auth: accept admin session (cookie) OR webhookSecret (header/query)
    const session = await requireAuth(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const globalYear = searchParams.get("year");

    // Support array for bulk insert
    if (Array.isArray(body)) {
      let createdCount = 0;
      for (const item of body) {
        const y = item.year !== undefined ? Number(item.year) : (globalYear ? Number(globalYear) : new Date().getFullYear());
        const m = Number(item.monthIndex ?? item.month);
        const p = Number(item.percentage);

        if (!isNaN(y) && !isNaN(m) && !isNaN(p)) {
          await db.cryptoMonthly.upsert({
            where: { year_monthIndex: { year: y, monthIndex: m } },
            update: { percentage: p },
            create: { year: y, monthIndex: m, percentage: p },
          });
          createdCount++;
        }
      }
      return NextResponse.json({ count: createdCount }, { status: 201 });
    }

    // Single insert fallback
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
    // Auth: accept admin session (cookie) OR webhookSecret (header/query)
    const session = await requireAuth(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { id, year, monthIndex, percentage } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

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

// DELETE — remove crypto monthly record(s)
export async function DELETE(request: NextRequest) {
  try {
    // Auth: accept admin session (cookie) OR webhookSecret (header/query)
    const session = await requireAuth(request);
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const year = searchParams.get("year");
    const month = searchParams.get("monthIndex") || searchParams.get("month");

    // Delete specific by ID
    if (id) {
      await db.cryptoMonthly.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Crypto record deleted" });
    }

    // Bulk delete for a specific year/month
    if (year && month) {
       const deleted = await db.cryptoMonthly.deleteMany({
        where: { year: parseInt(year), monthIndex: parseInt(month) }
      });
      return NextResponse.json({ success: true, count: deleted.count });
    }
    
    // Bulk delete for an entire year
    if (year && !month) {
       const deleted = await db.cryptoMonthly.deleteMany({
        where: { year: parseInt(year) }
      });
      return NextResponse.json({ success: true, count: deleted.count });
    }

    return NextResponse.json({ error: "id, or year and monthIndex are required" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting crypto record:", error);
    return NextResponse.json({ error: "Failed to delete crypto record" }, { status: 500 });
  }
}
