import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GET /api/log
// Returns list of logged conversations
export async function GET() {
  try {
    const logsDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logsDir)) {
      return NextResponse.json({ conversations: [] });
    }

    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    const conversations = files.map(filename => {
      try {
        const filePath = path.join(logsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const conversation = JSON.parse(content);

        // Extract timestamp from filename
        const timestamp = filename.replace('conversation-', '').replace('.json', '').replace(/-/g, ':').replace('T', 'T').replace('Z', 'Z');

        return {
          id: filename,
          timestamp: new Date(timestamp),
          messages: conversation,
          messageCount: conversation.length,
          preview: conversation.length > 0 ? conversation[0].content.substring(0, 100) + (conversation[0].content.length > 100 ? '...' : '') : 'Empty conversation'
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
// Body: { conversation: array of messages }
// Saves the conversation to a JSON file in logs directory
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

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `conversation-${timestamp}.json`;
    const filePath = path.join(logsDir, filename);

    // Save conversation as JSON
    fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));

    return NextResponse.json({ success: true, filename });

  } catch (error) {
    console.error("Log API error:", error);
    return NextResponse.json(
      { error: "Failed to save log" },
      { status: 500 }
    );
  }
}