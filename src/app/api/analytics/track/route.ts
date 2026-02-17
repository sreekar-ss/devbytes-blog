import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readingSessions } from "@/lib/db/schema";
import { detectBot } from "@/lib/analytics/bot-detection";
import { getHashedClientIp } from "@/lib/analytics/session";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      postId,
      postSlug,
      sessionId,
      userId = null,
      startedAt,
      timeSpent,
      scrollDepth,
      hasJavaScript = true,
    } = body;

    // Validate required fields
    if (!postId || !sessionId || timeSpent === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user agent and detect bots
    const userAgent = request.headers.get("user-agent") || "unknown";
    const botDetection = detectBot(userAgent, {
      timeSpent,
      scrollDepth,
      hasJavaScript,
    });

    // Get hashed IP
    const ipHash = await getHashedClientIp(request.headers);

    // Get referrer
    const referrer = request.headers.get("referer") || null;

    // Store reading session
    await db.insert(readingSessions).values({
      id: randomUUID(),
      userId,
      postId,
      sessionId,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: new Date(),
      timeSpent,
      scrollDepth: scrollDepth || 0,
      isBot: botDetection.isBot,
      userAgent,
      referrer,
      ipHash,
    });

    return NextResponse.json({
      success: true,
      isBot: botDetection.isBot,
      botType: botDetection.isGoodBot ? "good" : "unknown",
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track session" },
      { status: 500 }
    );
  }
}
