import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// ── helper: fetch a private blob server-side using the token ──
async function readPrivateBlob(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

// GET /api/log
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "conversation-", token: TOKEN });

    const conversations = await Promise.all(
      blobs
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .map(async (blob) => {
          try {
            const conversation = await readPrivateBlob(blob.url);
            return {
              id: blob.pathname,
              timestamp: new Date(blob.uploadedAt),
              messages: conversation,
              messageCount: conversation.length,
              preview:
                conversation.length > 0
                  ? conversation[0].content.substring(0, 100) +
                    (conversation[0].content.length > 100 ? "..." : "")
                  : "Empty conversation",
            };
          } catch (err) {
            console.error(`Error reading blob ${blob.pathname}:`, err);
            return null;
          }
        })
    );

    return NextResponse.json({
      conversations: conversations.filter(Boolean),
    });
  } catch (err) {
    console.error("Log GET error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve logs", detail: err.message },
      { status: 500 }
    );
  }
}

// POST /api/log
export async function POST(request) {
  try {
    const { conversation } = await request.json();

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: "Missing or invalid conversation" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `conversation-${timestamp}.json`;

    await put(filename, JSON.stringify(conversation, null, 2), {
      access: "private",          // ← matches your private store
      contentType: "application/json",
      token: TOKEN,
    });

    return NextResponse.json({ success: true, filename });
  } catch (err) {
    console.error("Log POST error:", err);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}