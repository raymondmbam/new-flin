import { NextResponse } from "next/server";
import { askFlin } from "@/lib/gemini";
import { extractTickers, getStockData, formatStockContext } from "@/lib/stockApi";
import { generateImage } from "@/lib/imagen";

// Detect if user wants an image
function isImageRequest(message) {
  const lower = message.toLowerCase();
  const triggers = [
    "generate an image",
    "create an image", 
    "draw",
    "show me a picture",
    "generate a chart image",
    "visualize",
  ];
  const isRequest = triggers.some((t) => lower.includes(t));

  // Log to confirm if image request is detected
  console.log("Is image request:", isRequest, "Message:", message);
  
  return isRequest;
}

// POST /api/chat
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

    // Check for image request 
    let imageUrl = null;

    if (isImageRequest(message)) {
      console.log("Image request detected, generating image...");
      const imagePrompt = `Financial illustration: ${message}. Professional, clean, business style.`;
      imageUrl = await generateImage(imagePrompt);  // Log the generation result
      console.log("Generated image URL:", imageUrl);
    }

    
    const tickers = extractTickers(message);

    
    let stockData = [];
    let stockContext = "";

    for (const ticker of tickers) {
      const data = await getStockData(ticker);
      if (data) {
        stockData.push(data);
        stockContext += formatStockContext(data) + "\n\n";
      }
    }

    const firstStock = stockData[0] ?? null;

    // ── 🤖 Step 3: Ask Gemini (Flin) ─────────────
    const reply = await askFlin(
      message,
      history,
      stockContext,
      userName || undefined
    );

    // ── 🚀 Step 4: Return everything ─────────────
    return NextResponse.json({
      reply,
      stockData: firstStock,
      imageUrl, // ← NEW
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}