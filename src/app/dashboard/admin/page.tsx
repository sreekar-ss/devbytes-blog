import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Users, Eye, Bot, TrendingUp, ArrowLeft } from "lucide-react";
import { getAdminAnalytics, getBotTraffic } from "@/lib/analytics/queries";
import { StatsCard } from "@/components/analytics/stats-card";
import Link from "next/link";

export const metadata = {
  title: "admin analytics | the vector",
  description: "Site-wide analytics and insights",
};

export default async function AdminAnalyticsPage() {
  const session = await auth();

  // Check if user is admin
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const analytics = await getAdminAnalytics(30);
  const botTraffic = await getBotTraffic(30);

  const botPercentage = analytics.totalViews > 0
    ? Math.round((analytics.botViews / analytics.totalViews) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Admin Analytics
        </h1>
        <p className="text-[var(--muted)]">
          Site-wide metrics and insights for the last 30 days
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          subtitle="All page views"
          icon={<Eye className="w-5 h-5" />}
        />
        <StatsCard
          title="Human Visitors"
          value={analytics.humanViews.toLocaleString()}
          subtitle="Real users"
          icon={<Users className="w-5 h-5" />}
        />
        <StatsCard
          title="Bot Traffic"
          value={analytics.botViews.toLocaleString()}
          subtitle={`${botPercentage}% of total`}
          icon={<Bot className="w-5 h-5" />}
        />
        <StatsCard
          title="Unique Visitors"
          value={analytics.uniqueVisitors.toLocaleString()}
          subtitle="By session"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Top Posts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Top Posts</h2>
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">Post</th>
                <th className="text-right px-6 py-3 text-sm font-semibold">Views</th>
                <th className="text-right px-6 py-3 text-sm font-semibold">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {analytics.topPosts.map((post) => {
                const avgTime = post.totalTime && post.views
                  ? Math.round(Number(post.totalTime) / Number(post.views))
                  : 0;

                return (
                  <tr key={post.postId} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="px-6 py-4">
                      {post.postSlug ? (
                        <Link
                          href={`/blog/${post.postSlug}`}
                          className="font-medium hover:text-[var(--accent)] transition-colors"
                        >
                          {post.postTitle || "Untitled"}
                        </Link>
                      ) : (
                        <span className="font-medium">{post.postTitle || "Untitled"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {Number(post.views).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-[var(--muted)]">
                      {formatSeconds(avgTime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Referrers */}
      {analytics.topReferrers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Top Referrers</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold">Source</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {analytics.topReferrers.map((ref, index) => (
                  <tr key={index} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">
                      {ref.referrer ? (
                        <a
                          href={ref.referrer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--accent)] transition-colors truncate block max-w-md"
                        >
                          {ref.referrer}
                        </a>
                      ) : (
                        <span className="text-[var(--muted)]">Direct</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {Number(ref.count).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bot Traffic Breakdown */}
      {botTraffic.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Bot Traffic Breakdown</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold">User Agent</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {botTraffic.slice(0, 10).map((bot, index) => (
                  <tr key={index} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs truncate max-w-md">
                      {bot.userAgent}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {Number(bot.count).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}
