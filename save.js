import { NextResponse } from "next/server";
import { askFlin } from "@/lib/gemini";
import { extractTickers, getStockData, formatStockContext } from "@/lib/stockApi";
import { generateImage } from "@/lib/imagen";

// POST /api/chat
// Body: { message: string, history: array }
// Returns: { reply: string, stockData: object | null }
export async function POST(request) {
  try {
    const body = await request.json();
    const { message, history, userName } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid message" },
        { status: 400 }
      );
    }

    // ── Step 1: Look for stock tickers in the user's message ──────────────
    const tickers = extractTickers(message);

    // ── Step 2: Fetch live stock data for all tickers ─────────────
let stockData = [];
let stockContext = "";

for (const ticker of tickers) {
  const data = await getStockData(ticker);
  if (data) {
    stockData.push(data);
    // Optionally append each to the context
    stockContext += formatStockContext(data) + "\n\n";
  }
}

// Only send first stock to StockCard if UI expects a single object
const firstStock = stockData[0] ?? null;

// ── Step 3: Ask Flin (Gemini) with full history + stock context ─────
const reply = await askFlin(message, history, stockContext, userName || undefined);

// ── Step 4: Return Flin's reply and any stock data ────────────
return NextResponse.json({ reply, stockData: firstStock });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

