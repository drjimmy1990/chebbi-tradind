import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const MONTH_LABELS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MONTH_LABELS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_LABELS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/**
 * Auto-generate MonthlyPerformance-style data from trades.
 * Formula from spreadsheet:
 *   Low Risk  = totalPips * $1 / $10,000 * 100  = totalPips / 100
 *   Medium Risk = totalPips * $2 / $10,000 * 100 = totalPips / 50
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

    // Group by year → month
    const yearMonthGroups: Record<string, Record<number, typeof trades>> = {};
    for (const t of trades) {
      const y = String(t.year);
      if (!yearMonthGroups[y]) yearMonthGroups[y] = {};
      if (!yearMonthGroups[y][t.month]) yearMonthGroups[y][t.month] = [];
      yearMonthGroups[y][t.month].push(t);
    }

    // Build MonthlyPerformance-compatible output
    interface MonthlyRow {
      id: string;
      year: number;
      monthIndex: number;
      monthLabelFr: string;
      monthLabelEn: string;
      monthLabelAr: string;
      lowRisk: number;
      mediumRisk: number;
      totalPips: number;
      wins: number;
      losses: number;
      totalTrades: number;
    }

    const all: MonthlyRow[] = [];
    const grouped: Record<string, MonthlyRow[]> = {};

    for (const [year, months] of Object.entries(yearMonthGroups)) {
      grouped[year] = [];
      for (const [monthIdx, monthTrades] of Object.entries(months)) {
        const mi = Number(monthIdx);
        const totalPips = monthTrades.reduce((s, t) => s + t.pips, 0);
        const row: MonthlyRow = {
          id: `${year}-${mi}`,
          year: Number(year),
          monthIndex: mi,
          monthLabelFr: MONTH_LABELS_FR[mi] || `Mois ${mi}`,
          monthLabelEn: MONTH_LABELS_EN[mi] || `Month ${mi}`,
          monthLabelAr: MONTH_LABELS_AR[mi] || `شهر ${mi}`,
          lowRisk: Math.round((totalPips / 100) * 100) / 100,
          mediumRisk: Math.round((totalPips / 50) * 100) / 100,
          totalPips,
          wins: monthTrades.filter(t => t.result === "W").length,
          losses: monthTrades.filter(t => t.result === "L").length,
          totalTrades: monthTrades.length,
        };
        grouped[year].push(row);
        all.push(row);
      }
      // Sort months within year
      grouped[year].sort((a, b) => a.monthIndex - b.monthIndex);
    }

    // Sort all
    all.sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex);

    return NextResponse.json({ data: grouped, all });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
