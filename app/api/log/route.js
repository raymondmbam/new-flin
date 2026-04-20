import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Helper: ensure logs directory exists
function getLogsDir() {
  const logsDir = path.join(process.cwd(), "logs");

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  return logsDir;
}

// GET /api/log
export async function GET() {
  try {
    const logsDir = getLogsDir();

    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith(".json"))
      .sort()
      .reverse();

    const conversations = files.map(filename => {
      try {
        const filePath = path.join(logsDir, filename);
        const content = fs.readFileSync(filePath, "utf8");

        const parsed = JSON.parse(content);

        // ✅ NEW: support both old + new format safely
        const messages = Array.isArray(parsed)
          ? parsed
          : parsed.messages || [];

        const createdAt = parsed.createdAt
          ? new Date(parsed.createdAt)
          : new Date(); // fallback instead of 1970

        return {
          id: filename,
          timestamp: createdAt,
          messages,
          messageCount: messages.length,
          preview:
            messages.length > 0
              ? messages[0].content.substring(0, 100) +
                (messages[0].content.length > 100 ? "..." : "")
              : "Empty conversation"
        };

      } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ conversations });

  } catch (error) {
    console.error("Log GET API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve logs" },
      { status: 500 }
    );
  }
}

// POST /api/log
export async function POST(request) {
  try {
    const body = await request.json();
    const { conversation } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: "Missing or invalid conversation" },
        { status: 400 }
      );
    }

    const logsDir = getLogsDir();

    const createdAt = new Date().toISOString();

    const filename = `conversation-${createdAt.replace(/[:.]/g, "-")}.json`;
    const filePath = path.join(logsDir, filename);

    // ✅ NEW: store structured data (fixes timestamp issue permanently)
    const payload = {
      createdAt,
      messages: conversation
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

    return NextResponse.json({ success: true, filename });

  } catch (error) {
    console.error("Log API error:", error);
    return NextResponse.json(
      { error: "Failed to save log" },
      { status: 500 }
    );
  }
}