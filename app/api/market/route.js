import { NextResponse } from "next/server";
import { getStockData } from "@/lib/stockApi";

// A fixed watchlist of popular tickers to scan
const WATCHLIST = [
  "NVDA", "AAPL", "MSFT", "TSLA", "AMZN",
  "META", "GOOGL", "AMD", "NFLX", "JPM",
  "BAC", "DIS", "SNAP", "UBER", "COIN",
];

// GET /api/market
// Returns { volume: [], gainers: [], losers: [] }
export async function GET() {
  try {
    // Fetch all quotes in parallel
    const results = await Promise.all(
      WATCHLIST.map((ticker) => getStockData(ticker))
    );

    // Filter out any failed fetches
    const stocks = results.filter(Boolean);

    // Sort into the three categories — top 5 each
    const byVolume  = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);
    const gainers   = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
    const losers    = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

    return NextResponse.json({ volume: byVolume, gainers, losers });
  } catch (error) {
    console.error("Market API error:", error);
    return NextResponse.json({ volume: [], gainers: [], losers: [] }, { status: 500 });
  }
}