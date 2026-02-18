import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Clock, BookOpen, TrendingUp, ArrowLeft } from "lucide-react";
import { getUserReadingStats } from "@/lib/analytics/queries";
import { StatsCard } from "@/components/analytics/stats-card";
import { ReadingHistory } from "@/components/analytics/reading-history";

export const metadata = {
  title: "my reading stats | the vector",
  description: "View your reading statistics and history",
};

export default async function StatsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const stats = await getUserReadingStats(session.user.id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          My Reading Stats
        </h1>
        <p className="text-[var(--muted)]">
          Track your reading progress and discover insights about your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Reading Time"
          value={formatReadingTime(stats.totalReadingTime)}
          subtitle="Time spent reading"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatsCard
          title="Posts Read"
          value={stats.uniquePostsRead}
          subtitle="Unique articles"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatsCard
          title="Reading Sessions"
          value={stats.totalSessions}
          subtitle="Total visits"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Reading History */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Reading History
        </h2>
        <ReadingHistory sessions={stats.sessions} />
      </div>
    </div>
  );
}

function formatReadingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
