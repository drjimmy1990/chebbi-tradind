import { NextResponse } from "next/server";

// ─── TradingView Scanner API (no API key required) ────────
const TV_FOREX_URL = "https://scanner.tradingview.com/forex/scan";
const TV_CFD_URL = "https://scanner.tradingview.com/cfd/scan";
const TV_CRYPTO_URL = "https://scanner.tradingview.com/crypto/scan";

const COLUMNS = ["close", "change", "description", "high", "low"];

// Build a TradingView scanner POST body
function buildBody(tickers: string[]) {
  return JSON.stringify({
    symbols: { tickers },
    columns: COLUMNS,
  });
}

interface TVData {
  s: string; // e.g. "FX:EURUSD"
  d: (number | string | null)[];
}

interface TVResponse {
  data?: TVData[];
}

async function fetchTV(url: string, tickers: string[]): Promise<TVData[]> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: buildBody(tickers),
      next: { revalidate: 10 }, // cache for 10 seconds
    });
    if (!res.ok) return [];
    const json: TVResponse = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

// Symbol display mapping
const DISPLAY_MAP: Record<string, string> = {
  "FX:EURUSD": "EUR/USD",
  "FX:GBPUSD": "GBP/USD",
  "FX:USDJPY": "USD/JPY",
  "FX:USDCAD": "USD/CAD",
  "FX:AUDUSD": "AUD/USD",
  "OANDA:XAUUSD": "XAU/USD",
  "OANDA:XAGUSD": "XAG/USD",
  "CRYPTO:BTCUSD": "BTC/USD",
};

const DECIMALS_MAP: Record<string, number> = {
  "FX:EURUSD": 4,
  "FX:GBPUSD": 4,
  "FX:USDJPY": 2,
  "FX:USDCAD": 4,
  "FX:AUDUSD": 4,
  "OANDA:XAUUSD": 2,
  "OANDA:XAGUSD": 2,
  "CRYPTO:BTCUSD": 0,
};

export async function GET() {
  try {
    // Fetch all three markets in parallel
    const [forexData, cfdData, cryptoData] = await Promise.all([
      fetchTV(TV_FOREX_URL, [
        "FX:EURUSD",
        "FX:GBPUSD",
        "FX:USDJPY",
        "FX:USDCAD",
        "FX:AUDUSD",
      ]),
      fetchTV(TV_CFD_URL, ["OANDA:XAUUSD", "OANDA:XAGUSD"]),
      fetchTV(TV_CRYPTO_URL, ["CRYPTO:BTCUSD"]),
    ]);

    const allData = [...cfdData, ...forexData, ...cryptoData];

    const prices = allData.map((item) => ({
      symbol: DISPLAY_MAP[item.s] || item.s,
      price: item.d[0] as number,       // close
      change: item.d[1] as number,       // change %
      high: item.d[3] as number,         // daily high
      low: item.d[4] as number,          // daily low
      decimals: DECIMALS_MAP[item.s] ?? 2,
    }));

    return NextResponse.json(
      { data: prices, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching TradingView prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
