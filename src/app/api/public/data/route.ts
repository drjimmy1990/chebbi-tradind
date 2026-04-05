import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public route — no auth required
// Returns site settings, testimonials, and trade stats in one call for the landing page
export async function GET() {
  try {
    const [settingsRaw, testimonials, trades] = await Promise.all([
      db.siteSetting.findMany(),
      db.testimonial.findMany({ orderBy: [{ createdAt: "asc" }] }),
      db.trade.findMany({ select: { result: true, pips: true, year: true, month: true } }),
    ]);

    // Convert settings array to key-value map
    const settings: Record<string, string> = {};
    for (const s of settingsRaw) {
      settings[s.key] = s.value;
    }

    // Compute real-time trade stats
    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.result === "W").length;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    const totalPips = trades.reduce((sum, t) => sum + (t.pips > 0 ? t.pips : 0), 0);

    // Count distinct active months (unique year+month combos)
    const activeMonths = new Set(trades.map((t) => `${t.year}-${t.month}`)).size;

    const tradeStats = { totalTrades, wins, winRate, totalPips, activeMonths };

    return NextResponse.json({ settings, testimonials, tradeStats });
  } catch (error) {
    console.error("Error fetching public data:", error);
    return NextResponse.json({ error: "Failed to fetch public data" }, { status: 500 });
  }
}
