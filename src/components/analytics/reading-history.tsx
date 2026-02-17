import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReadingHistoryItem {
  id: string;
  postTitle: string | null;
  postSlug: string | null;
  startedAt: Date | null;
  timeSpent: number | null;
  scrollDepth: number | null;
}

interface ReadingHistoryProps {
  sessions: ReadingHistoryItem[];
}

export function ReadingHistory({ sessions }: ReadingHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-[var(--muted)]">No reading history yet. Start reading to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="glass-card p-4 hover:border-[var(--accent)] transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {session.postSlug ? (
                <Link
                  href={`/blog/${session.postSlug}`}
                  className="font-medium hover:text-[var(--accent)] transition-colors line-clamp-1"
                >
                  {session.postTitle || "Untitled Post"}
                </Link>
              ) : (
                <p className="font-medium text-[var(--muted)]">
                  {session.postTitle || "Untitled Post"}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {session.startedAt ? formatDate(session.startedAt) : "Unknown date"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatReadingTime(session.timeSpent || 0)}
                </span>
                {session.scrollDepth !== null && (
                  <span className="text-xs">
                    {session.scrollDepth}% read
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatReadingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
