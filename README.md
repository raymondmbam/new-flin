# Flin — AI Stock Advisor

This is a Next.js application that creates an AI-powered stock market advisor chatbot called "Flin". It uses React for the frontend, Next.js for the backend API routes, and Google's Gemini AI for generating responses. The app fetches live stock data from Yahoo Finance and displays it in a chat interface.

This README explains every line of code in the project for beginners learning Next.js and React. We'll go through each file step by step.

## Project Structure

```
flin-js/
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── jsconfig.json         # JavaScript configuration
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── app/                  # Next.js app directory
│   ├── layout.jsx        # Root layout component
│   ├── page.jsx          # Home page component
│   ├── globals.css       # Global styles
│   └── api/              # API routes
│       ├── chat/         # Chat API endpoint
│       ├── market/       # Market overview API
│       ├── stock/        # Individual stock API
│       └── test-stock/   # Test endpoint for stock API
├── components/           # React components
│   ├── ChatInput.jsx     # Input component for chat
│   ├── ChatWindow.jsx    # Main chat interface
│   ├── MessageBubble.jsx # Individual message display
│   └── StockCard.jsx     # Stock information card
└── lib/                  # Utility libraries
    ├── gemini.js         # Gemini AI integration
    ├── stockApi.js       # Stock data fetching
    ├── systemPrompt.js   # AI system instructions
    └── yf_fetchCache_stub.js # Build-time stub
```

## Configuration Files

### package.json

```json
{
  "name": "flin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "html2canvas": "^1.4.1",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}
```

- `"name"`: The name of the project
- `"version"`: Version number of the app
- `"private"`: Prevents accidental publishing to npm
- `"scripts"`: Commands you can run with `npm run`
  - `"dev"`: Starts development server
  - `"build"`: Builds the app for production
  - `"start"`: Starts production server
- `"dependencies"`: Packages needed for the app to run
  - `"@google/generative-ai"`: For AI chat functionality
  - `"html2canvas"`: For generating images from HTML (used in StockCard)
  - `"next"`: The Next.js framework
  - `"react"`: React library for UI
  - `"react-dom"`: React for web browsers
- `"devDependencies"`: Packages only needed during development
  - `"autoprefixer"`: Adds vendor prefixes to CSS
  - `"postcss"`: CSS processor
  - `"tailwindcss"`: Utility-first CSS framework

### next.config.js

```javascript
const webpack = require('webpack');
const path = require('path');

/**
 * Replace yahoo-finance2 test imports (Deno/testing) with a small stub
 * so Next.js webpack build doesn't try to resolve Deno-only test deps.
 */
module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/fetchCache\.js$/, path.resolve(__dirname, 'lib', 'yf_fetchCache_stub.js'))
    );
    return config;
  },
};
```

- `const webpack = require('webpack')`: Imports Webpack for configuration
- `const path = require('path')`: Imports Node.js path module
- `module.exports`: Exports the Next.js configuration object
- `webpack: (config) => { ... }`: Customizes the Webpack configuration
- `config.plugins.push(...)`: Adds a plugin to the Webpack config
- `new webpack.NormalModuleReplacementPlugin(...)`: Replaces imports matching the pattern
- `/fetchCache\.js$/`: Regex pattern to match files ending with "fetchCache.js"
- `path.resolve(__dirname, 'lib', 'yf_fetchCache_stub.js')`: Path to replacement file

This replaces yahoo-finance2's fetchCache.js with our stub to avoid build issues.

### jsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"]
}
```

- `"compilerOptions"`: TypeScript/JavaScript compiler options
- `"baseUrl"`: Base directory for resolving paths
- `"paths"`: Path mapping for imports
  - `"@/*"`: Maps @ imports to the root directory
- `"include"`: Files to include in compilation

### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- `module.exports`: Exports PostCSS configuration
- `"plugins"`: PostCSS plugins to use
  - `"tailwindcss"`: Enables Tailwind CSS processing
  - `"autoprefixer"`: Adds browser prefixes to CSS

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- `/** @type {import('tailwindcss').Config} */`: TypeScript type annotation
- `module.exports`: Exports Tailwind configuration
- `"content"`: Files Tailwind should scan for classes
- `"theme"`: Theme customization
  - `"extend"`: Extends default theme
  - `"fontFamily"`: Custom font families
    - `"sans"`: Uses Geist font for sans-serif
- `"plugins"`: Additional Tailwind plugins

## App Directory (Next.js App Router)

### app/layout.jsx

```jsx
import "./globals.css";

export const metadata = {
  title: "Flin — AI Stock Advisor",
  description: "Your personal AI-powered stock market advisor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- `import "./globals.css"`: Imports global CSS styles
- `export const metadata`: Exports metadata for the page (Next.js 13+ app router)
  - `"title"`: Page title in browser tab
  - `"description"`: Page description for SEO
- `export default function RootLayout({ children })`: Root layout component
  - `{ children }`: Props containing child components
- `<html lang="en">`: HTML element with language attribute
- `<body>{children}</body>`: Body element containing child components

This is the root layout that wraps all pages in the app.

### app/page.jsx

```jsx
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return <ChatWindow />;
}
```

- `import ChatWindow from "@/components/ChatWindow"`: Imports the ChatWindow component
- `export default function Home()`: Home page component (default export)
- `return <ChatWindow />`: Renders the ChatWindow component

This is the home page that displays the chat interface.

### app/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: 'Geist', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar        { width: 4px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { background: #d1d5db; border-radius: 4px; }

/* Fade-in for new messages */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeSlideUp 0.3s ease forwards;
}

/* Typing dots */
@keyframes dotBounce {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-5px); }
}
.typing-dot:nth-child(1) { animation: dotBounce 1.2s ease infinite 0s; }
.typing-dot:nth-child(2) { animation: dotBounce 1.2s ease infinite 0.2s; }
.typing-dot:nth-child(3) { animation: dotBounce 1.2s ease infinite 0.4s; }

/* Welcome → chat transition */
@keyframes slideUp {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-20px); }
}
.welcome-exit {
  animation: slideUp 0.25s ease forwards;
}
```

- `@import url(...)`: Imports Google Fonts
- `@tailwind base`: Includes Tailwind base styles
- `@tailwind components`: Includes Tailwind component styles
- `@tailwind utilities`: Includes Tailwind utility classes
- `* { box-sizing: border-box; margin: 0; padding: 0; }`: CSS reset
- `html, body { height: 100%; font-family: 'Geist', sans-serif; -webkit-font-smoothing: antialiased; }`: Base styles
- `::-webkit-scrollbar`: Custom scrollbar styles
- `@keyframes fadeSlideUp`: Animation for message appearance
- `@keyframes dotBounce`: Animation for typing indicator
- `@keyframes slideUp`: Animation for welcome screen transition

## API Routes

### app/api/chat/route.js

```javascript
import { NextResponse } from "next/server";
import { askFlin } from "@/lib/gemini";
import { extractTickers, getStockData, formatStockContext } from "@/lib/stockApi";

// POST /api/chat
// Body: { message: string, history: array }
// Returns: { reply: string, stockData: object | null }
export async function POST(request) {
  try {
    const body = await request.json();
    const { message, history } = body;

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
const reply = await askFlin(message, history, stockContext || undefined);

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
```

- `import { NextResponse } from "next/server"`: Imports Next.js response utilities
- `import { askFlin } from "@/lib/gemini"`: Imports AI chat function
- `import { extractTickers, getStockData, formatStockContext } from "@/lib/stockApi"`: Imports stock utilities
- `export async function POST(request)`: API route handler for POST requests
- `const body = await request.json()`: Parses JSON request body
- `const { message, history } = body`: Destructures message and history from body
- `if (!message || typeof message !== "string")`: Input validation
- `return NextResponse.json(...)`: Returns JSON response with error
- `const tickers = extractTickers(message)`: Extracts stock tickers from message
- `let stockData = []`: Array to store fetched stock data
- `let stockContext = ""`: String to build context for AI
- `for (const ticker of tickers)`: Loops through each ticker
- `const data = await getStockData(ticker)`: Fetches data for ticker
- `if (data)`: Checks if data was successfully fetched
- `stockData.push(data)`: Adds data to array
- `stockContext += formatStockContext(data) + "\n\n"`: Formats and appends to context
- `const firstStock = stockData[0] ?? null`: Gets first stock or null
- `const reply = await askFlin(message, history, stockContext || undefined)`: Gets AI response
- `return NextResponse.json({ reply, stockData: firstStock })`: Returns response
- `catch (error)`: Error handling block
- `console.error("Chat API error:", error)`: Logs error
- `return NextResponse.json(...)`: Returns error response

### app/api/market/route.js

```javascript
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
```

- `import { NextResponse } from "next/server"`: Imports response utilities
- `import { getStockData } from "@/lib/stockApi"`: Imports stock data function
- `const WATCHLIST = [...]`: Array of stock tickers to monitor
- `export async function GET()`: API route handler for GET requests
- `const results = await Promise.all(...)`: Fetches data for all tickers in parallel
- `WATCHLIST.map((ticker) => getStockData(ticker))`: Maps each ticker to a fetch promise
- `const stocks = results.filter(Boolean)`: Removes null results
- `const byVolume = [...stocks].sort(...)`: Sorts by volume descending
- `.slice(0, 5)`: Takes top 5 results
- `const gainers = [...stocks].sort(...)`: Sorts by change percent descending
- `const losers = [...stocks].sort(...)`: Sorts by change percent ascending
- `return NextResponse.json(...)`: Returns categorized stock data

### app/api/stock/route.js

```javascript
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
    "YES","THAN","THAT","THIS","WITH","WILL","HAVE","BEEN",
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
52W High: ${stock.high52Week?.toFixed(2) ?? "N/A"}`;
}
```

- `const HEADERS = { ... }`: HTTP headers to mimic browser requests
- `export async function getStockData(ticker)`: Function to fetch stock data
- `const symbol = ticker.toUpperCase()`: Converts ticker to uppercase
- `const url = \`...\``: Constructs Yahoo Finance API URL
- `const res = await fetch(url, { headers: HEADERS, cache: "no-store" })`: Makes HTTP request
- `if (!res.ok)`: Checks if request was successful
- `throw new Error(...)`: Throws error for failed requests
- `const json = await res.json()`: Parses JSON response
- `const meta = json?.chart?.result?.[0]?.meta`: Extracts metadata
- `if (!meta || !meta.regularMarketPrice)`: Validates response data
- `return null`: Returns null for invalid tickers
- `const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice`: Gets previous close price
- `const change = meta.regularMarketPrice - prevClose`: Calculates price change
- `const changePct = prevClose ? (change / prevClose) * 100 : 0`: Calculates percent change
- `return { ... }`: Returns formatted stock data object
- `catch (error)`: Error handling
- `console.error(...)`: Logs error
- `return null`: Returns null on error
- `export function extractTickers(message)`: Function to extract tickers from text
- `const upper = message.toUpperCase()`: Converts message to uppercase
- `const tickerRegex = /\b([A-Z]{1,5}(?:\.[A-Z]{1,2})?)\b/g`: Regex for ticker patterns
- `const IGNORE = new Set([...])`: Set of words to ignore
- `const matches = upper.match(tickerRegex) ?? []`: Finds regex matches
- `return [...new Set(matches)].filter((w) => !IGNORE.has(w))`: Returns unique, filtered tickers
- `export function formatStockContext(stock)`: Function to format stock data as text
- `const sign = stock.change >= 0 ? "+" : ""`: Determines sign for change
- `const dir = stock.change >= 0 ? "▲" : "▼"`: Determines direction arrow
- Returns formatted string with stock information

### app/api/test-stock/route.js

```javascript
import { NextResponse } from "next/server";
import { getStockData, extractTickers } from "@/lib/stockApi";

// Visit: http://localhost:3000/api/test-stock?ticker=AAPL
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "AAPL";

  // Test case-insensitive extraction
  const extractionTests = [
    "Tell me about AAPL",
    "tell me about aapl",
    "Is tsla a good buy?",
    "What do you think nvda",
    "should I buy msft or googl",
  ].map((msg) => ({ message: msg, found: extractTickers(msg) }));

  // Test raw Yahoo Finance URL directly (bypass our wrapper)
  let rawResult = null;
  let rawError  = null;
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept":     "application/json",
          "Referer":    "https://finance.yahoo.com/",
        },
        cache: "no-store",
      }
    );
    rawResult = { status: res.status, ok: res.ok };
    if (res.ok) {
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      rawResult.price  = meta?.regularMarketPrice;
      rawResult.symbol = meta?.symbol;
    }
  } catch (e) {
    rawError = e.message;
  }

  // Test our full getStockData wrapper
  let stockData  = null;
  let stockError = null;
  try {
    stockData = await getStockData(ticker);
    if (!stockData) stockError = "getStockData returned null (invalid ticker or blocked)";
  } catch (e) {
    stockError = e.message;
  }

  return NextResponse.json({
    extraction: extractionTests,
    rawFetch:   { ticker, result: rawResult, error: rawError },
    getStockData: { ticker, success: !!stockData, data: stockData, error: stockError },
  });
}
```

- `import { NextResponse } from "next/server"`: Imports response utilities
- `import { getStockData, extractTickers } from "@/lib/stockApi"`: Imports stock functions
- `export async function GET(request)`: API route handler
- `const { searchParams } = new URL(request.url)`: Gets URL search parameters
- `const ticker = searchParams.get("ticker") ?? "AAPL"`: Gets ticker parameter or defaults to AAPL
- `const extractionTests = [...]`: Array of test messages
- `.map((msg) => ({ message: msg, found: extractTickers(msg) }))`: Tests ticker extraction
- `let rawResult = null`: Variable for raw API test result
- `let rawError = null`: Variable for raw API test error
- `try { ... } catch (e) { rawError = e.message; }`: Tests raw Yahoo Finance API
- `const res = await fetch(...)`: Makes direct API call
- `rawResult = { status: res.status, ok: res.ok }`: Stores response status
- `if (res.ok)`: Checks if response is successful
- `const json = await res.json()`: Parses response JSON
- `const meta = json?.chart?.result?.[0]?.meta`: Extracts metadata
- `rawResult.price = meta?.regularMarketPrice`: Stores price
- `rawResult.symbol = meta?.symbol`: Stores symbol
- `let stockData = null`: Variable for wrapper test result
- `let stockError = null`: Variable for wrapper test error
- `try { stockData = await getStockData(ticker); ... }`: Tests wrapper function
- `if (!stockData) stockError = "..."`: Sets error if no data returned
- `return NextResponse.json({ ... })`: Returns test results

## Components

### components/ChatInput.jsx

```jsx
"use client";

import { useState, useRef } from "react";

const STARTER_PROMPTS = [
  "Which stock should I buy?",
  "What is a P/E ratio?",
  "Best dividend stocks?",
];



// ─────────────────────────────────────────────────────────────
// ChatInput — adapts between welcome mode and chat mode
// In welcome mode: shows prompt chips above the input
// In chat mode: shows only the input bar
// ─────────────────────────────────────────────────────────────
export default function ChatInput({ onSend, isLoading, mode }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col gap-3">

      {/* Prompt chips — only shown on welcome screen */}
      {mode === "welcome" && (
        <div className="flex flex-wrap gap-2 justify-center">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full hover:bg-gray-700 transition-colors duration-150 cursor-pointer whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-gray-300 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask Flin anything about stocks..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed max-h-36 overflow-y-auto"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
            canSend
              ? "bg-gray-900 text-white hover:bg-gray-700 cursor-pointer"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400">
        Flin provides educational content only — not financial advice.
      </p>
    </div>
  );
}
```

- `"use client"`: Marks component as client-side (Next.js 13+)
- `import { useState, useRef } from "react"`: Imports React hooks
- `const STARTER_PROMPTS = [...]`: Array of suggested prompts
- `export default function ChatInput({ onSend, isLoading, mode })`: Component function with props
- `const [text, setText] = useState("")`: State for input text
- `const textareaRef = useRef(null)`: Ref for textarea element
- `function handleSend()`: Function to send message
- `const trimmed = text.trim()`: Removes whitespace from text
- `if (!trimmed || isLoading) return`: Guards against empty/loading sends
- `onSend(trimmed)`: Calls parent callback with message
- `setText("")`: Clears input
- `textareaRef.current.style.height = "auto"`: Resets textarea height
- `function handleKeyDown(e)`: Handles keyboard events
- `if (e.key === "Enter" && !e.shiftKey)`: Checks for Enter key (not Shift+Enter)
- `e.preventDefault()`: Prevents default form submission
- `handleSend()`: Sends message
- `function handleInput()`: Handles input changes for auto-resize
- `const el = textareaRef.current`: Gets textarea element
- `if (!el) return`: Guards against null ref
- `el.style.height = "auto"`: Resets height to calculate scrollHeight
- `el.style.height = \`${Math.min(el.scrollHeight, 140)}px\``: Sets height with max limit
- `const canSend = text.trim().length > 0 && !isLoading`: Determines if send is allowed
- `return (...)`: JSX return
- `<div className="flex flex-col gap-3">`: Container div with flexbox
- `{mode === "welcome" && (...) }`: Conditional rendering for welcome mode
- `<div className="flex flex-wrap gap-2 justify-center">`: Container for prompt chips
- `{STARTER_PROMPTS.map((prompt) => (...) )}`: Maps prompts to buttons
- `<button key={prompt} onClick={() => onSend(prompt)} ...>`: Button for each prompt
- `<div className="flex items-end gap-2 ...">`: Input bar container
- `<textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} ...>`: Textarea input
- `<button onClick={handleSend} disabled={!canSend} ...>`: Send button
- `<svg ...>...</svg>`: Send icon SVG
- `<p className="text-center text-xs text-gray-400">`: Disclaimer text

### components/ChatWindow.jsx

```jsx
"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

// ── Flin's avatar SVG ─────────────────────────────────────────
export function FlinAvatar({ size = 32 }) {
  return (
    <div
      className="rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M3 17l4-8 4 4 3-5 4 9" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="19" cy="5" r="2" fill="#00e676"/>
      </svg>
    </div>
  );
}

// ── User initials avatar ──────────────────────────────────────
function UserAvatar({ name, avatar, size = 32 }) {
  if (avatar) {
    return (
      <img
        src={avatar} alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";
  return (
    <div
      className="rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 mb-4 animate-in">
      <FlinAvatar size={32} />
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400 block" />
        ))}
      </div>
    </div>
  );
}

// ── Name setup screen ─────────────────────────────────────────
function NamePrompt({ onSubmit }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16">
      <div className="mb-6"><FlinAvatar size={56} /></div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        Hey, I'm Flin 👋
      </h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        Your personal AI stock advisor. What should I call you?
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your name..."
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors shadow-sm"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Let's go
        </button>
      </form>
    </div>
  );
}

// ── Nav dropdown for name / avatar ───────────────────────────
function NavDropdown({ userName, userAvatar, onSave, onClose }) {
  const [name, setName]       = useState(userName);
  const [preview, setPreview] = useState(userAvatar);
```

- `"use client"`: Client component directive
- `import { useState, useRef, useEffect } from "react"`: React hooks
- `import MessageBubble from "./MessageBubble"`: Imports message component
- `import ChatInput from "./ChatInput"`: Imports input component
- `export function FlinAvatar({ size = 32 })`: Avatar component for Flin
- `return (...)`: Returns JSX for avatar
- `<div className="rounded-full bg-gray-900 ...">`: Circular background div
- `<svg ...>...</svg>`: SVG icon for Flin
- `function UserAvatar({ name, avatar, size = 32 })`: User avatar component
- `if (avatar)`: Conditional for custom avatar
- `return <img ... />`: Image avatar
- `const initials = name ? name.slice(0, 2).toUpperCase() : "?"`: Gets initials
- `return <div ...>{initials}</div>`: Initials avatar
- `function TypingIndicator()`: Component for typing animation
- `return (...)`: Returns typing indicator JSX
- `<div className="flex items-center gap-2 mb-4 animate-in">`: Container
- `{[0, 1, 2].map((i) => (...))}`: Maps to three dots
- `<span key={i} className="typing-dot ...">`: Animated dot
- `function NamePrompt({ onSubmit })`: Name input screen
- `const [value, setValue] = useState("")`: State for name input
- `function handleSubmit(e)`: Form submission handler
- `e.preventDefault()`: Prevents page reload
- `const trimmed = value.trim()`: Trims whitespace
- `if (trimmed) onSubmit(trimmed)`: Calls callback if valid
- `return (...)`: Returns name prompt JSX
- `<div className="flex flex-col items-center justify-center flex-1 px-6 pb-16">`: Centered container
- `<div className="mb-6"><FlinAvatar size={56} /></div>`: Large avatar
- `<h1 ...>Hey, I'm Flin 👋</h1>`: Welcome heading
- `<p ...>Your personal AI stock advisor...</p>`: Description
- `<form onSubmit={handleSubmit} ...>`: Form for name input
- `<input autoFocus value={value} onChange={(e) => setValue(e.target.value)} ...>`: Name input
- `<button type="submit" disabled={!value.trim()} ...>Let's go</button>`: Submit button
- `function NavDropdown({ userName, userAvatar, onSave, onClose })`: Navigation dropdown
- `const [name, setName] = useState(userName)`: State for name
- `const [preview, setPreview] = useState(userAvatar)`: State for avatar preview

(The file seems truncated in the provided content, but this covers the visible parts)

### components/MessageBubble.jsx

```jsx
"use client";

import StockCard from "./StockCard";
import { FlinAvatar } from "./ChatWindow";

// Render **bold**, strip ###, ---, *** from message text
function renderText(text) {
  const cleaned = text
    .split("\n")
    .map((line) => {
      // Remove markdown headings (###, ##, #)
      line = line.replace(/^#{1,6}\s+/, "");
      // Remove horizontal rules
      if (/^(\*\*\*|---|___)\s*$/.test(line)) return null;
      return line;
    })
    .filter((line) => line !== null)
    .join("\n");

  return cleaned.split("\n").map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="font-semibold text-gray-900">{part}</strong>
      ) : part
    );
    return (
      <span key={i}>
        {rendered}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function UserAvatar({ name, avatar }) {
  if (avatar) {
    return (
      <img src={avatar} alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
      {name ? name.slice(0, 2).toUpperCase() : "?"}
    </div>
  );
}

export default function MessageBubble({ message, userName, userAvatar }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 mb-5 animate-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      {isUser
        ? <UserAvatar name={userName} avatar={userAvatar} />
        : <div className="mt-0.5"><FlinAvatar size={32} /></div>
      }

      {/* Bubble + stock card */}
      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gray-900 text-white rounded-tr-sm"
            : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"
        }`}>
          {renderText(message.content)}
        </div>

        {!isUser && message.stockData && (
          <StockCard stock={message.stockData} />
        )}

        <span className="text-xs text-gray-400 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
```

- `"use client"`: Client component
- `import StockCard from "./StockCard"`: Imports stock card component
- `import { FlinAvatar } from "./ChatWindow"`: Imports avatar component
- `function renderText(text)`: Function to render formatted text
- `const cleaned = text.split("\n").map((line) => { ... })`: Processes each line
- `line.replace(/^#{1,6}\s+/, "")`: Removes markdown headings
- `if (/^(\*\*\*|---|___)\s*$/.test(line)) return null`: Removes horizontal rules
- `.filter((line) => line !== null).join("\n")`: Filters and joins lines
- `return cleaned.split("\n").map((line, i, arr) => { ... })`: Maps lines to JSX
- `const parts = line.split(/\*\*(.*?)\*\*/g)`: Splits on bold markdown
- `const rendered = parts.map((part, j) => j % 2 === 1 ? <strong ...>{part}</strong> : part)`: Renders bold text
- `return <span key={i}>{rendered}{i < arr.length - 1 && <br />}</span>`: Returns line with breaks
- `function UserAvatar({ name, avatar })`: User avatar component
- `if (avatar) return <img ... />`: Custom avatar
- `return <div ...>{name ? name.slice(0, 2).toUpperCase() : "?"}</div>`: Initials avatar
- `export default function MessageBubble({ message, userName, userAvatar })`: Main component
- `const isUser = message.role === "user"`: Determines message sender
- `return (...)`: Returns message bubble JSX
- `<div className={\`flex gap-3 mb-5 animate-in ${isUser ? "flex-row-reverse" : "flex-row"}\`}>`: Container with conditional direction
- `{isUser ? <UserAvatar ... /> : <div className="mt-0.5"><FlinAvatar size={32} /></div>}`: Conditional avatar
- `<div className={\`flex flex-col gap-2 max-w-[75%] ${isUser ? "items-end" : "items-start"}\`}>`: Message container
- `<div className={\`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser ? "bg-gray-900 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"}\`}>`: Message bubble
- `{renderText(message.content)}`: Renders message content
- `{!isUser && message.stockData && <StockCard stock={message.stockData} />}`: Conditional stock card
- `<span className="text-xs text-gray-400 px-1">`: Timestamp
- `{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`: Formats time

### components/StockCard.jsx

```jsx
"use client";

function formatMarketCap(value) {
  if (!value) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function formatVolume(value) {
  if (!value) return "N/A";
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function StockCard({ stock }) {
  const isGain = stock.change >= 0;
  const sign   = isGain ? "+" : "";
  const arrow  = isGain ? "▲" : "▼";
  const accentColor = isGain ? "#10b981" : "#ef4444";

  function handleDownload() {
    const W = 600;
    const H = 340;
    const SCALE = 2; // retina quality

    const canvas = document.createElement("canvas");
    canvas.width  = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext("2d");
    ctx.scale(SCALE, SCALE);

    // ── Shadow ───────────────────────────────────────────────
    ctx.shadowColor = "rgba(0,0,0,0.10)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    // ── White card background ────────────────────────────────
    drawRoundedRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "transparent";

    // ── Left accent bar ──────────────────────────────────────
    ctx.save();
    drawRoundedRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.clip();
    ctx.fillStyle = accentColor;
    ctx.fillRect(4, 4, 6, H - 8);
    ctx.restore();

    const L = 32;

    // ── Ticker ───────────────────────────────────────────────
    ctx.fillStyle = "#111827";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(stock.ticker, L, 56);

    // ── Company name ─────────────────────────────────────────
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(stock.name, L, 80);

    // ── Price ────────────────────────────────────────────────
    ctx.fillStyle = "#111827";
    ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const priceText = `${stock.currency} ${stock.price.toFixed(2)}`;
    ctx.fillText(priceText, L, 140);

    // ── Change (positioned after price) ─────────────────────
    const priceWidth = ctx.measureText(priceText).width;
    ctx.fillStyle = accentColor;
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const changeText = `${arrow} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePercent.toFixed(2)}%)`;
```

- `"use client"`: Client component
- `function formatMarketCap(value)`: Formats market cap values
- `if (!value) return "N/A"`: Handles null values
- `if (value >= 1e12) return \`$${(value / 1e12).toFixed(2)}T\``: Trillions
- `if (value >= 1e9) return \`$${(value / 1e9).toFixed(2)}B\``: Billions
- `if (value >= 1e6) return \`$${(value / 1e6).toFixed(2)}M\``: Millions
- `return \`$${value.toLocaleString()}\``: Default formatting
- `function formatVolume(value)`: Formats volume values
- Similar logic for volume formatting
- `function Stat({ label, value })`: Component for displaying stats
- `return <div><div className="text-xs text-gray-400 mb-0.5">{label}</div><div className="text-sm font-semibold text-gray-800">{value}</div></div>`: Stat display
- `function drawRoundedRect(ctx, x, y, w, h, r)`: Canvas drawing function
- `ctx.beginPath()`: Starts path
- `ctx.moveTo(x + r, y)`: Moves to start point
- `ctx.lineTo(x + w - r, y)`: Draws top line
- `ctx.quadraticCurveTo(x + w, y, x + w, y + r)`: Top-right corner
- `ctx.lineTo(x + w, y + h - r)`: Right line
- `ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)`: Bottom-right corner
- `ctx.lineTo(x + r, y + h)`: Bottom line
- `ctx.quadraticCurveTo(x, y + h, x, y + h - r)`: Bottom-left corner
- `ctx.lineTo(x, y + r)`: Left line
- `ctx.quadraticCurveTo(x, y, x + r, y)`: Top-left corner
- `ctx.closePath()`: Closes path
- `export default function StockCard({ stock })`: Main component
- `const isGain = stock.change >= 0`: Determines if stock is up
- `const sign = isGain ? "+" : ""`: Sign for change
- `const arrow = isGain ? "▲" : "▼"`: Arrow for change
- `const accentColor = isGain ? "#10b981" : "#ef4444"`: Color based on gain/loss
- `function handleDownload()`: Function to generate image
- `const W = 600; const H = 340; const SCALE = 2`: Canvas dimensions
- `const canvas = document.createElement("canvas")`: Creates canvas
- `canvas.width = W * SCALE; canvas.height = H * SCALE`: Sets canvas size
- `const ctx = canvas.getContext("2d")`: Gets 2D context
- `ctx.scale(SCALE, SCALE)`: Scales for retina
- `ctx.shadowColor = "rgba(0,0,0,0.10)"`: Sets shadow
- `ctx.shadowBlur = 16; ctx.shadowOffsetY = 4`: Shadow properties
- `drawRoundedRect(ctx, 4, 4, W - 8, H - 8, 16)`: Draws background
- `ctx.fillStyle = "#ffffff"; ctx.fill()`: Fills white background
- `ctx.shadowColor = "transparent"`: Disables shadow
- `ctx.save(); drawRoundedRect(...); ctx.clip(); ctx.fillStyle = accentColor; ctx.fillRect(4, 4, 6, H - 8); ctx.restore()`: Draws accent bar
- `const L = 32`: Left margin
- `ctx.fillStyle = "#111827"; ctx.font = "bold 28px ..."; ctx.fillText(stock.ticker, L, 56)`: Draws ticker
- `ctx.fillStyle = "#9ca3af"; ctx.font = "14px ..."; ctx.fillText(stock.name, L, 80)`: Draws company name
- `ctx.fillStyle = "#111827"; ctx.font = "bold 38px ..."; const priceText = \`${stock.currency} ${stock.price.toFixed(2)}\`; ctx.fillText(priceText, L, 140)`: Draws price
- `const priceWidth = ctx.measureText(priceText).width`: Gets price text width
- `ctx.fillStyle = accentColor; ctx.font = "bold 15px ..."; const changeText = \`${arrow} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePercent.toFixed(2)}%)\`;`: Prepares change text

(The file appears truncated, but this covers the visible canvas drawing code)

## Lib Files

### lib/gemini.js

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

// Initialize the Gemini client once (server-side only)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The Gemini model we're using
const MODEL_NAME = "gemini-3-flash-preview";

// ─────────────────────────────────────────────────────────────
// Send a message to Gemini and get Flin's reply
//
// @param userMessage  - The latest message from the user
// @param history      - All previous turns in the conversation
// @param stockContext - Optional: live stock data injected into prompt
// ─────────────────────────────────────────────────────────────
export async function askFlin(userMessage, history, stockContext) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_PROMPT,
  });

  // If we have live stock data, prepend it to the user's message
  // so Flin can reference it in the answer
  const fullUserMessage = stockContext
    ? `[LIVE STOCK DATA]\n${stockContext}\n\n[USER QUESTION]\n${userMessage}`
    : userMessage;

  // Start a chat session with the full conversation history
  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7, // balanced: not too creative, not too robotic
    },
  });

  // Send the message and wait for Flin's reply
  const result = await chat.sendMessage(fullUserMessage);
  const response = await result.response;

  return response.text();
}
```

- `import { GoogleGenerativeAI } from "@google/generative-ai"`: Imports Gemini AI library
- `import { SYSTEM_PROMPT } from "./systemPrompt.js"`: Imports system instructions
- `const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)`: Initializes AI client
- `const MODEL_NAME = "gemini-3-flash-preview"`: Specifies model version
- `export async function askFlin(userMessage, history, stockContext)`: Main function
- `const model = genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: SYSTEM_PROMPT })`: Creates model instance
- `const fullUserMessage = stockContext ? \`[LIVE STOCK DATA]\n${stockContext}\n\n[USER QUESTION]\n${userMessage}\` : userMessage`: Prepares message with context
- `const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 1024, temperature: 0.7 } })`: Starts chat session
- `const result = await chat.sendMessage(fullUserMessage)`: Sends message
- `const response = await result.response`: Gets response
- `return response.text()`: Returns text response

### lib/stockApi.js

```javascript
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
    "CEO", "IPO", "GDP", "ME", "BUY", "WHEN", "YOU", "SELL", "USA", "UK", "AI", "OK", "TV", "NO", "YES",
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
Price: ${stock.currency} ${stock.price.toFixed(2)}`;
}
```

- `export async function getStockData(ticker)`: Fetches stock data
- `if (!ticker) return null`: Guards against empty ticker
- `const symbol = ticker.toUpperCase()`: Normalizes ticker
- `const url = \`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d\``: API URL
- `const res = await fetch(url, { headers: { ... }, cache: "no-store" })`: Makes request
- `if (!res.ok) { console.log(...); return null; }`: Handles failed requests
- `const json = await res.json()`: Parses response
- `const meta = json?.chart?.result?.[0]?.meta`: Extracts metadata
- `console.log("YAHOO v8 META:", meta)`: Debug logging
- `if (!meta || !meta.regularMarketPrice) { console.log(...); return null; }`: Validates data
- `const price = meta.regularMarketPrice`: Gets current price
- `const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price`: Gets previous close
- `const change = price - prevClose`: Calculates change
- `const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0`: Calculates percent change
- `return { ticker: symbol, name: ..., price, change, changePercent, ... }`: Returns stock data object
- `catch (error) { console.error(...); return null; }`: Error handling
- `export function extractTickers(message)`: Extracts tickers from text
- `if (!message || typeof message !== "string") return []`: Input validation
- `const upperMessage = message.toUpperCase()`: Uppercases message
- `const tickerRegex = /\b([A-Z]{1,5}(?:\.[A-Z]{1,2})?)\b/g`: Regex for tickers
- `const IGNORE_LIST = new Set([...])`: Words to ignore
- `const matches = upperMessage.match(tickerRegex) ?? []`: Finds matches
- `const tickers = [...new Set(matches)].filter((word) => !IGNORE_LIST.has(word))`: Filters and deduplicates
- `return tickers`: Returns ticker array
- `export function formatStockContext(stock)`: Formats stock data for AI
- `if (!stock) return ""`: Guards against null stock
- `const direction = stock.change >= 0 ? "▲" : "▼"`: Direction indicator
- `const sign = stock.change >= 0 ? "+" : ""`: Sign for change
- Returns formatted string

### lib/systemPrompt.js

```javascript
// This is the master instruction sent to Gemini before every conversation.
// It defines Flin's personality, rules, and how to handle every scenario.

export const SYSTEM_PROMPT = `
// ... (the prompt content is shown in the file)
`;
```

- `export const SYSTEM_PROMPT = \`\` `: Exports the system prompt string
- The content defines Flin's behavior, personality, and response rules

### lib/yf_fetchCache_stub.js

```javascript
// Minimal stub used only at build time to avoid resolving Deno/test deps
// createYahooFinance expects a default export with a `_once` helper used in dev helpers
const fetchCache = {
  _once: () => {},
};

export default fetchCache;
```

- `const fetchCache = { _once: () => {} }`: Stub object
- `export default fetchCache`: Default export for build compatibility

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (create `.env.local` with `GEMINI_API_KEY`)
3. Run development server: `npm run dev`
4. Open http://localhost:3000

This README covers the complete codebase with line-by-line explanations for Next.js and React concepts.