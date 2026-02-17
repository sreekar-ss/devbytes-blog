import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Eye, EyeOff, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { DifficultyBadge } from "@/components/blog/difficulty-badge";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const sessionUser = session.user as Record<string, unknown>;
  const githubUsername = sessionUser.githubUsername as string;

  // Get user from DB
  const dbUser = db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername))
    .get();

  if (!dbUser) redirect("/auth/signin");

  // Get user's posts
  const userPosts = db
    .select()
    .from(posts)
    .where(eq(posts.authorId, dbUser.id))
    .orderBy(desc(posts.createdAt))
    .all();

  const publishedCount = userPosts.filter((p) => p.published).length;
  const draftCount = userPosts.filter((p) => !p.published).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Welcome back, {dbUser.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
          <SignOutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="glass-card p-5 hover:transform-none">
          <p className="text-2xl font-bold">{userPosts.length}</p>
          <p className="text-sm text-[var(--muted)]">Total Posts</p>
        </div>
        <div className="glass-card p-5 hover:transform-none">
          <p className="text-2xl font-bold text-emerald-500">
            {publishedCount}
          </p>
          <p className="text-sm text-[var(--muted)]">Published</p>
        </div>
        <div className="glass-card p-5 hover:transform-none">
          <p className="text-2xl font-bold text-amber-500">{draftCount}</p>
          <p className="text-sm text-[var(--muted)]">Drafts</p>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-4">Your Posts</h2>
        {userPosts.length === 0 ? (
          <div className="glass-card p-12 text-center hover:transform-none">
            <FileText className="w-10 h-10 text-[var(--muted)] mx-auto mb-4" />
            <p className="text-[var(--muted)] mb-4">
              You haven&apos;t written any posts yet.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Write your first post
            </Link>
          </div>
        ) : (
          userPosts.map((post) => (
            <div
              key={post.id}
              className="glass-card p-5 flex items-center justify-between gap-4 hover:transform-none"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.published ? (
                    <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <h3 className="font-semibold truncate">{post.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post.readingTime} min read</span>
                  <DifficultyBadge difficulty={post.difficulty} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                    title="View post"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href={`/dashboard/edit/${post.slug}`}
                  className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                  title="Edit post"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

