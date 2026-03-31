// No library — direct calls to Yahoo Finance's public API
// More reliable than yahoo-finance2 which breaks when Yahoo changes their cookie flow

// Browser-like headers so Yahoo doesn't block the request
const HEADERS = {
  "User-Agent":      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Accept":          "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer":         "https://finance.yahoo.com/",
  "Origin":          "https://finance.yahoo.com",
};

// ─────────────────────────────────────────────────────────────
// Fetch live stock data for a single ticker
// Uses Yahoo Finance v8 chart endpoint — no auth needed
// ─────────────────────────────────────────────────────────────
export async function getStockData(ticker) {
  const symbol = ticker.toUpperCase();

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

    const res = await fetch(url, {
      headers: HEADERS,
      // Tell Next.js not to cache this — we always want live data
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Yahoo Finance returned HTTP ${res.status} for ${symbol}`);
    }

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;

    if (!meta || !meta.regularMarketPrice) {
      return null; // invalid ticker
    }

    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
    const change    = meta.regularMarketPrice - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;

    return {
      ticker:        meta.symbol,
      name:          meta.longName ?? meta.shortName ?? meta.symbol,
      price:         meta.regularMarketPrice,
      change:        parseFloat(change.toFixed(4)),
      changePercent: parseFloat(changePct.toFixed(4)),
      volume:        meta.regularMarketVolume ?? 0,
      marketCap:     meta.marketCap ?? null,
      high52Week:    meta.fiftyTwoWeekHigh ?? null,
      low52Week:     meta.fiftyTwoWeekLow  ?? null,
      currency:      meta.currency ?? "USD",
    };
  } catch (error) {
    console.error(`[Stock] fetch failed for ${symbol}: ${error.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Extract ticker symbols from a user message — case-insensitive
// "tell me about aapl" → ["AAPL"]
// "Is tsla a good buy?" → ["TSLA"]
// ─────────────────────────────────────────────────────────────
export function extractTickers(message) {
  // Uppercase the full message first so "aapl" → "AAPL" before matching
  const upper       = message.toUpperCase();
  const tickerRegex = /\b([A-Z]{1,5}(?:\.[A-Z]{1,2})?)\b/g;

  // Common English words and finance jargon to skip
  const IGNORE = new Set([
    "A","AN","I","IS","IT","IN","ON","AT","TO","BE","DO","GO","OR","US",
    "AM","PM","NO","OK","TV","UK",
    "AND","BUT","FOR","NOT","HAS","HAD","WAS","ARE","ALL","ANY","YOU",
    "CAN","THE","HOW","WHO","WHY","NEW","OLD","TOP","LOW","HIGH",
    "BUY","SELL","GOOD","BEST","SAFE","GIVE","SHOW","TELL","WHAT",
    "YES","THAN","THAT","THIS","WITH","WILL","FROM","HAVE","BEEN",
    "ETF","CEO","IPO","GDP","USA","AI","PE","EPS","ROE","ROI","YTD",
    "ABOUT","THINK","STOCK","PRICE","WOULD","WHICH","COULD","SHOULD",
  ]);

  const matches = upper.match(tickerRegex) ?? [];
  return [...new Set(matches)].filter((w) => !IGNORE.has(w));
}

// ─────────────────────────────────────────────────────────────
// Format stock data as plain text for Gemini's context
// ─────────────────────────────────────────────────────────────
export function formatStockContext(stock) {
  const sign = stock.change >= 0 ? "+" : "";
  const dir  = stock.change >= 0 ? "▲" : "▼";
  return `
${stock.name} (${stock.ticker})
Price: ${stock.currency} ${stock.price.toFixed(2)}
Change: ${dir} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePercent.toFixed(2)}%)
Volume: ${stock.volume.toLocaleString()}
Market Cap: ${stock.marketCap ? "$" + (stock.marketCap / 1e9).toFixed(2) + "B" : "N/A"}
52W High: ${stock.high52Week?.toFixed(2) ?? "N/A"}
52W Low:  ${stock.low52Week?.toFixed(2)  ?? "N/A"}
  `.trim();
}