import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readingSessions } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Sync anonymous reading sessions to authenticated user account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Update all reading sessions with this sessionId to associate with user
    const result = await db
      .update(readingSessions)
      .set({ userId: session.user.id })
      .where(
        and(
          eq(readingSessions.sessionId, sessionId),
          isNull(readingSessions.userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Sessions synced successfully",
    });
  } catch (error) {
    console.error("Session sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync sessions" },
      { status: 500 }
    );
  }
}
