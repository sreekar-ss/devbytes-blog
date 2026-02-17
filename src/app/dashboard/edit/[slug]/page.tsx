import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, postTags, tags, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PostEditor } from "@/components/dashboard/post-editor";
import { updatePost, deletePost } from "../../actions";

type Props = {
  params: Promise<{ slug: string }>;
};

export const metadata = {
  title: "Edit Post",
};

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const sessionUser = session.user as Record<string, unknown>;
  const githubUsername = sessionUser.githubUsername as string;

  const dbUser = db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername))
    .get();

  if (!dbUser) redirect("/auth/signin");

  const post = db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.authorId, dbUser.id)))
    .get();

  if (!post) notFound();

  // Get tags for this post
  const postTagRows = db
    .select()
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, post.id))
    .all();

  const tagNames = postTagRows.map((pt) => pt.tags.name);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <PostEditor
        initialData={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          difficulty: post.difficulty as "beginner" | "intermediate" | "advanced",
          coverImage: post.coverImage || "",
          tagNames,
          published: post.published,
          featured: post.featured,
        }}
        onSubmit={async (data) => {
          "use server";
          await updatePost(post.id, data);
        }}
        onDelete={async () => {
          "use server";
          await deletePost(post.id);
        }}
      />
    </div>
  );
}

