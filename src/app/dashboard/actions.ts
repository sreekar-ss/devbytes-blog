"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, tags, postTags, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { slugify, calculateReadingTime } from "@/lib/utils";

type PostFormData = {
  title: string;
  excerpt: string;
  content: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  coverImage?: string;
  tagNames: string[];
  published: boolean;
  featured: boolean;
};

async function getSessionUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const sessionUser = session.user as Record<string, unknown>;
  const githubUsername = sessionUser.githubUsername as string;

  const dbUser = db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername))
    .get();

  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

function ensureTagsExist(tagNames: string[]): string[] {
  return tagNames.map((name) => {
    const slug = slugify(name);
    const existing = db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .get();

    if (existing) return existing.id;

    const id = randomUUID();
    db.insert(tags).values({ id, name: name.trim(), slug }).run();
    return id;
  });
}

export async function createPost(data: PostFormData) {
  const user = await getSessionUser();
  const slug = slugify(data.title);
  const readingTime = calculateReadingTime(data.content);
  const postId = randomUUID();
  const now = new Date();

  // Check slug uniqueness
  const existing = db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .get();

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  db.insert(posts)
    .values({
      id: postId,
      slug: finalSlug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      authorId: user.id,
      difficulty: data.difficulty,
      readingTime,
      published: data.published,
      featured: data.featured,
      publishedAt: data.published ? now : null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  // Handle tags
  if (data.tagNames.length > 0) {
    const tagIds = ensureTagsExist(data.tagNames);
    for (const tagId of tagIds) {
      db.insert(postTags).values({ postId, tagId }).run();
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updatePost(postId: string, data: PostFormData) {
  const user = await getSessionUser();
  const readingTime = calculateReadingTime(data.content);
  const now = new Date();

  // Verify ownership
  const post = db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)))
    .get();

  if (!post) throw new Error("Post not found or unauthorized");

  const wasPublished = post.published;

  db.update(posts)
    .set({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      difficulty: data.difficulty,
      readingTime,
      published: data.published,
      featured: data.featured,
      publishedAt: data.published && !wasPublished ? now : post.publishedAt,
      updatedAt: now,
    })
    .where(eq(posts.id, postId))
    .run();

  // Update tags: remove old, add new
  db.delete(postTags).where(eq(postTags.postId, postId)).run();

  if (data.tagNames.length > 0) {
    const tagIds = ensureTagsExist(data.tagNames);
    for (const tagId of tagIds) {
      db.insert(postTags).values({ postId, tagId }).run();
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deletePost(postId: string) {
  const user = await getSessionUser();

  const post = db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)))
    .get();

  if (!post) throw new Error("Post not found or unauthorized");

  db.delete(postTags).where(eq(postTags.postId, postId)).run();
  db.delete(posts).where(eq(posts.id, postId)).run();

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

