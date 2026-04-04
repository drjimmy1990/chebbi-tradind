import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

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
    // Auth: accept admin session (cookie) OR webhookSecret (header/query)
    const session = await requireAuth(request);
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);

    // Globals for bulk inserts if passed in query
    const globalYear = searchParams.get("year");
    const globalMonth = searchParams.get("month");

    const body = await request.json();

    // Support array for bulk insert (either direct array or wrapped in a 'trades' object)
    const tradesArray = Array.isArray(body) ? body : (Array.isArray(body.trades) ? body.trades : null);

    if (tradesArray) {
      const dataToInsert = tradesArray.map((trade: any) => {
        const y = trade.year !== undefined ? Number(trade.year) : (globalYear ? Number(globalYear) : new Date().getFullYear());
        const m = trade.month !== undefined && trade.month !== "" ? Number(trade.month) : (globalMonth ? Number(globalMonth) : new Date().getMonth());

        return {
          year: isNaN(y) ? new Date().getFullYear() : y,
          month: isNaN(m) ? new Date().getMonth() : m,
          contract: String(trade.contract || ""),
          period: String(trade.period || ""),
          direction: String(trade.direction || ""),
          entry: Number(trade.entry) || 0,
          exit: Number(trade.exit) || 0,
          pips: Number(trade.pips) || 0,
          result: String(trade.result || "W"),
        };
      });

      const created = await db.trade.createMany({
        data: dataToInsert,
      });

      return NextResponse.json({ count: created.count }, { status: 201 });
    }

    const { year, month, contract, period, direction, entry, exit, pips, result } = body;

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
    console.error("Error creating trade(s):", error);
    return NextResponse.json({ error: "Failed to create trade(s)" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Auth: accept admin session (cookie) OR webhookSecret (header/query)
    const session = await requireAuth(request);
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // Delete a specific trade by ID
    if (id) {
      await db.trade.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Trade deleted" });
    }

    // Bulk delete for a specific month/year (Used by n8n sync)
    if (year && month) {
      const deleted = await db.trade.deleteMany({
        where: {
          year: parseInt(year),
          month: parseInt(month)
        }
      });
      return NextResponse.json({ success: true, count: deleted.count, message: `Deleted trades for ${year}/${month}` });
    }

    return NextResponse.json({ error: "id, or year and month are required" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting trade(s):", error);
    return NextResponse.json({ error: "Failed to delete trade(s)" }, { status: 500 });
  }
}
