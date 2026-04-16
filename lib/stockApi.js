// ─────────────────────────────────────────────────────────────
// Fetch live stock data for a single ticker using Yahoo Finance v8
// Returns null if the ticker is invalid or the request fails
// ─────────────────────────────────────────────────────────────
export async function getStockData(ticker) {
  if (!ticker) return null;

  const symbol = ticker.toUpperCase();

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://finance.yahoo.com",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log(`❌ Yahoo returned ${res.status} for ${symbol}`);
      return null;
    }

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;

    console.log("YAHOO v8 META:", meta);

    if (!meta || !meta.regularMarketPrice) {
      console.log("❌ No valid market price returned for:", symbol);
      return null;
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return {
      ticker: symbol,
      name: meta.longName ?? meta.shortName ?? symbol,
      price,
      change,
      changePercent,
      volume: meta.regularMarketVolume ?? 0,
      marketCap: null, // not available in v8 chart endpoint
      high52Week: meta.fiftyTwoWeekHigh ?? null,
      low52Week: meta.fiftyTwoWeekLow ?? null,
      currency: meta.currency ?? "USD",
    };
  } catch (error) {
    console.error(`Fetch error for ${symbol}:`, error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Extract all stock ticker symbols from a user's message
//
// Matches patterns like: AAPL, TSLA, MSFT, BRK.B
// Ignores common short words that happen to be all-caps
// ─────────────────────────────────────────────────────────────
export function extractTickers(message) {
  if (!message || typeof message !== "string") return [];

  const upperMessage = message.toUpperCase();
  const tickerRegex = /\b([A-Z]{1,5}(?:\.[A-Z]{1,2})?)\b/g;

  // Words to ignore — common English words that look like tickers
  const IGNORE_LIST = new Set([
    "I", "A", "AN", "THE", "IS", "IT", "IN", "ON", "AT", "TO", "BE",
    "DO", "GO", "US", "AM", "PM", "OR", "AND", "FOR", "NOT", "BUT",
    "CAN", "HAS", "HAD", "YOU", "WAS", "ARE", "ALL", "ANY", "ETF",
    "CEO", "IPO", "GDP", "ME", "BUY", "WHEN", "YOU", "SELL", "USA", "UK", 
    "AI", "OK", "TV", "NO", "YES", "A","AN","I","IS","IT","IN","ON","AT","TO","BE","DO","GO","OR","US",
    "AM","PM","NO","OK","TV","UK", "AGAIN", "TRY", "IMAGE", "WORKS", "POINTS", "CHART", "CHARTS",
    "AND","BUT","FOR","NOT","HAS","HAD","WAS","ARE","ALL","ANY","YOU",
    "CAN","THE","HOW","WHO","WHY","NEW","OLD","TOP","LOW","HIGH", "AS",
    "BUY","SELL","GOOD","BEST","SAFE","GIVE","SHOW","TELL","WHAT",
    "YES","THAN","THAT","THIS","WITH","WILL","FROM","HAVE","BEEN", "HE", "SHE", "THEY",
    "ETF","CEO","IPO","GDP","USA","AI","PE","EPS","ROE","ROI","YTD", "BOTH",
    "ABOUT","THINK","STOCK","PRICE","WOULD","WHICH","COULD","SHOULD", "WORKS", "CAR", "OF"
  ]);

  const matches = upperMessage.match(tickerRegex) ?? [];

  // De-duplicate and filter out ignored words
  const tickers = [...new Set(matches)].filter((word) => !IGNORE_LIST.has(word));

  return tickers;
}

// ─────────────────────────────────────────────────────────────
// Format stock data as a readable string for the AI's context
// ─────────────────────────────────────────────────────────────
export function formatStockContext(stock) {
  if (!stock) return "";

  const direction = stock.change >= 0 ? "▲" : "▼";
  const sign = stock.change >= 0 ? "+" : "";

  return `
${stock.name} (${stock.ticker})
Price: ${stock.currency} ${stock.price.toFixed(2)}
Change: ${direction} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePercent.toFixed(2)}%)
Volume: ${stock.volume.toLocaleString()}
Market Cap: N/A
52-Week High: ${stock.high52Week?.toFixed(2) ?? "N/A"}
52-Week Low: ${stock.low52Week?.toFixed(2) ?? "N/A"}
  `.trim();
}