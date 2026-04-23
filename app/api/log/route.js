import { NextResponse } from "next/server";
import { put, list, download } from "@vercel/blob";

// GET /api/log
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "conversation-" });

    const conversations = await Promise.all(
      blobs
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .map(async (blob) => {
          try {
            const { body } = await download(blob.url);
            const text = await new Response(body).text();
            const conversation = JSON.parse(text);

            return {
              id: blob.pathname,
              timestamp: new Date(blob.uploadedAt),
              messages: conversation,
              messageCount: conversation.length,
              preview: conversation.length > 0
                ? conversation[0].content.substring(0, 100) + (conversation[0].content.length > 100 ? '...' : '')
                : 'Empty conversation'
            };
          } catch (error) {
            console.error(`Error reading blob ${blob.pathname}:`, error);
            return null;
          }
        })
    );

    return NextResponse.json({ conversations: conversations.filter(Boolean) });

  } catch (error) {
    console.error("Log GET API error:", error);
    return NextResponse.json({ 
      error: "Failed to retrieve logs",
      detail: error.message
    }, { status: 500 });
  }
}

// POST /api/log
export async function POST(request) {
  try {
    const body = await request.json();
    const { conversation } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: "Missing or invalid conversation" }, { status: 400 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `conversation-${timestamp}.json`;

    await put(filename, JSON.stringify(conversation, null, 2), {
      access: "private",
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, filename });

  } catch (error) {
    console.error("Log API error:", error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}