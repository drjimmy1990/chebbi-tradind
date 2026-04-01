import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Auto-calculated stats from trades.
 * Replaces the spreadsheet right-side formulas:
 *   - Total Trades, W, L, BE
 *   - Winrate = W / (W + L)
 *   - Total PIPS = SUM(pips)
 *   - Biggest Win = MAX(pips where W)
 *   - Biggest Loss = MIN(pips where L)
 *   - Monthly performance: lowRisk% = totalPips/100, mediumRisk% = totalPips/50
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");

    const where = yearParam ? { year: parseInt(yearParam) } : {};

    const trades = await db.trade.findMany({
      where,
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    // --- Per-year stats ---
    const yearGroups: Record<string, typeof trades> = {};
    for (const t of trades) {
      const y = String(t.year);
      if (!yearGroups[y]) yearGroups[y] = [];
      yearGroups[y].push(t);
    }

    const yearStats: Record<string, {
      totalTrades: number;
      wins: number;
      losses: number;
      breakEven: number;
      winrate: number;
      totalPips: number;
      biggestWin: number;
      biggestLoss: number;
      lowRiskPct: number;
      mediumRiskPct: number;
    }> = {};

    for (const [year, list] of Object.entries(yearGroups)) {
      const wins = list.filter(t => t.result === "W").length;
      const losses = list.filter(t => t.result === "L").length;
      const breakEven = list.filter(t => t.result === "BE").length;
      const totalPips = list.reduce((sum, t) => sum + t.pips, 0);

      const winPips = list.filter(t => t.result === "W").map(t => t.pips);
      const lossPips = list.filter(t => t.result === "L").map(t => t.pips);

      yearStats[year] = {
        totalTrades: list.length,
        wins,
        losses,
        breakEven,
        winrate: wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0,
        totalPips,
        biggestWin: winPips.length > 0 ? Math.max(...winPips) : 0,
        biggestLoss: lossPips.length > 0 ? Math.min(...lossPips) : 0,
        // Spreadsheet formula: lowRisk = totalPips * $1 / $10,000 * 100
        lowRiskPct: Math.round((totalPips / 100) * 100) / 100,
        // mediumRisk = totalPips * $2 / $10,000 * 100
        mediumRiskPct: Math.round((totalPips / 50) * 100) / 100,
      };
    }

    // --- Per-month breakdown (for charts) ---
    const monthlyBreakdown: Record<string, {
      monthIndex: number;
      totalPips: number;
      lowRisk: number;
      mediumRisk: number;
      wins: number;
      losses: number;
      totalTrades: number;
    }[]> = {};

    for (const [year, list] of Object.entries(yearGroups)) {
      const monthGroups: Record<number, typeof trades> = {};
      for (const t of list) {
        if (!monthGroups[t.month]) monthGroups[t.month] = [];
        monthGroups[t.month].push(t);
      }

      monthlyBreakdown[year] = Object.entries(monthGroups)
        .map(([monthIdx, mTrades]) => {
          const mp = mTrades.reduce((s, t) => s + t.pips, 0);
          return {
            monthIndex: Number(monthIdx),
            totalPips: mp,
            lowRisk: Math.round((mp / 100) * 100) / 100,
            mediumRisk: Math.round((mp / 50) * 100) / 100,
            wins: mTrades.filter(t => t.result === "W").length,
            losses: mTrades.filter(t => t.result === "L").length,
            totalTrades: mTrades.length,
          };
        })
        .sort((a, b) => a.monthIndex - b.monthIndex);
    }

    return NextResponse.json({
      yearStats,
      monthlyBreakdown,
      totalTrades: trades.length,
    });
  } catch (error) {
    console.error("Error calculating trade stats:", error);
    return NextResponse.json({ error: "Failed to calculate stats" }, { status: 500 });
  }
}
