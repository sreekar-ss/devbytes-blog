/**
 * Analytics database queries
 */

import { db } from "@/lib/db";
import { readingSessions, analyticsEvents, posts, users } from "@/lib/db/schema";
import { eq, and, desc, sql, gte, count, sum } from "drizzle-orm";

/**
 * Get user reading statistics
 */
export async function getUserReadingStats(userId: string) {
  // Get all reading sessions for user
  const sessions = await db
    .select({
      id: readingSessions.id,
      postId: readingSessions.postId,
      postTitle: posts.title,
      postSlug: posts.slug,
      startedAt: readingSessions.startedAt,
      timeSpent: readingSessions.timeSpent,
      scrollDepth: readingSessions.scrollDepth,
    })
    .from(readingSessions)
    .leftJoin(posts, eq(readingSessions.postId, posts.id))
    .where(and(eq(readingSessions.userId, userId), eq(readingSessions.isBot, false)))
    .orderBy(desc(readingSessions.startedAt))
    .limit(100);

  // Calculate total reading time
  const totalTimeResult = await db
    .select({ total: sum(readingSessions.timeSpent) })
    .from(readingSessions)
    .where(and(eq(readingSessions.userId, userId), eq(readingSessions.isBot, false)));

  const totalReadingTime = Number(totalTimeResult[0]?.total || 0);

  // Get unique posts read count
  const uniquePostsResult = await db
    .select({ count: count() })
    .from(
      db
        .selectDistinct({ postId: readingSessions.postId })
        .from(readingSessions)
        .where(and(eq(readingSessions.userId, userId), eq(readingSessions.isBot, false)))
        .as("unique_posts")
    );

  const uniquePostsRead = uniquePostsResult[0]?.count || 0;

  return {
    sessions,
    totalReadingTime,
    uniquePostsRead,
    totalSessions: sessions.length,
  };
}

/**
 * Get reading history grouped by date
 */
export async function getUserReadingHistory(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sessions = await db
    .select({
      date: sql<string>`date(${readingSessions.startedAt} / 1000, 'unixepoch')`,
      timeSpent: sum(readingSessions.timeSpent),
      sessionCount: count(),
    })
    .from(readingSessions)
    .where(
      and(
        eq(readingSessions.userId, userId),
        eq(readingSessions.isBot, false),
        gte(readingSessions.startedAt, startDate)
      )
    )
    .groupBy(sql`date(${readingSessions.startedAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${readingSessions.startedAt} / 1000, 'unixepoch')`);

  return sessions;
}

/**
 * Get admin analytics - site-wide metrics
 */
export async function getAdminAnalytics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Total page views
  const totalViewsResult = await db
    .select({ count: count() })
    .from(readingSessions)
    .where(gte(readingSessions.startedAt, startDate));

  const totalViews = totalViewsResult[0]?.count || 0;

  // Human vs bot traffic
  const trafficBreakdown = await db
    .select({
      isBot: readingSessions.isBot,
      count: count(),
    })
    .from(readingSessions)
    .where(gte(readingSessions.startedAt, startDate))
    .groupBy(readingSessions.isBot);

  const humanViews = trafficBreakdown.find((t) => !t.isBot)?.count || 0;
  const botViews = trafficBreakdown.find((t) => t.isBot)?.count || 0;

  // Unique visitors (by session ID)
  const uniqueVisitorsResult = await db
    .select({ count: count() })
    .from(
      db
        .selectDistinct({ sessionId: readingSessions.sessionId })
        .from(readingSessions)
        .where(and(gte(readingSessions.startedAt, startDate), eq(readingSessions.isBot, false)))
        .as("unique_sessions")
    );

  const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;

  // Top posts by views
  const topPosts = await db
    .select({
      postId: readingSessions.postId,
      postTitle: posts.title,
      postSlug: posts.slug,
      views: count(),
      totalTime: sum(readingSessions.timeSpent),
    })
    .from(readingSessions)
    .leftJoin(posts, eq(readingSessions.postId, posts.id))
    .where(and(gte(readingSessions.startedAt, startDate), eq(readingSessions.isBot, false)))
    .groupBy(readingSessions.postId, posts.title, posts.slug)
    .orderBy(desc(count()))
    .limit(10);

  // Traffic over time (daily)
  const dailyTraffic = await db
    .select({
      date: sql<string>`date(${readingSessions.startedAt} / 1000, 'unixepoch')`,
      humanViews: sql<number>`sum(case when ${readingSessions.isBot} = 0 then 1 else 0 end)`,
      botViews: sql<number>`sum(case when ${readingSessions.isBot} = 1 then 1 else 0 end)`,
    })
    .from(readingSessions)
    .where(gte(readingSessions.startedAt, startDate))
    .groupBy(sql`date(${readingSessions.startedAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${readingSessions.startedAt} / 1000, 'unixepoch')`);

  // Top referrers
  const topReferrers = await db
    .select({
      referrer: readingSessions.referrer,
      count: count(),
    })
    .from(readingSessions)
    .where(
      and(
        gte(readingSessions.startedAt, startDate),
        eq(readingSessions.isBot, false),
        sql`${readingSessions.referrer} IS NOT NULL AND ${readingSessions.referrer} != ''`
      )
    )
    .groupBy(readingSessions.referrer)
    .orderBy(desc(count()))
    .limit(10);

  return {
    totalViews,
    humanViews,
    botViews,
    uniqueVisitors,
    topPosts,
    dailyTraffic,
    topReferrers,
  };
}

/**
 * Get bot traffic breakdown
 */
export async function getBotTraffic(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const botSessions = await db
    .select({
      userAgent: readingSessions.userAgent,
      count: count(),
    })
    .from(readingSessions)
    .where(and(gte(readingSessions.startedAt, startDate), eq(readingSessions.isBot, true)))
    .groupBy(readingSessions.userAgent)
    .orderBy(desc(count()))
    .limit(20);

  return botSessions;
}

/**
 * Get AI endpoint usage (llms.txt, /api/posts)
 */
export async function getAIEndpointUsage(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const endpointUsage = await db
    .select({
      eventType: analyticsEvents.eventType,
      path: analyticsEvents.path,
      isBot: analyticsEvents.isBot,
      count: count(),
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, startDate))
    .groupBy(analyticsEvents.eventType, analyticsEvents.path, analyticsEvents.isBot)
    .orderBy(desc(count()));

  return endpointUsage;
}

/**
 * Get user bookmarks
 */
export async function getUserBookmarks(userId: string) {
  const { userBookmarks } = await import("@/lib/db/schema");

  const bookmarks = await db
    .select({
      postId: userBookmarks.postId,
      postTitle: posts.title,
      postSlug: posts.slug,
      postExcerpt: posts.excerpt,
      createdAt: userBookmarks.createdAt,
    })
    .from(userBookmarks)
    .leftJoin(posts, eq(userBookmarks.postId, posts.id))
    .where(eq(userBookmarks.userId, userId))
    .orderBy(desc(userBookmarks.createdAt));

  return bookmarks;
}
