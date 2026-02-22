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

  const dbUsers = await db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername));

  const dbUser = dbUsers[0];
  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

async function ensureTagsExist(tagNames: string[]): Promise<string[]> {
  const tagIds: string[] = [];
  for (const name of tagNames) {
    const slug = slugify(name);
    const existingTags = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug));

    const existing = existingTags[0];

    if (existing) {
      tagIds.push(existing.id);
    } else {
      const id = randomUUID();
      await db.insert(tags).values({ id, name: name.trim(), slug });
      tagIds.push(id);
    }
  }
  return tagIds;
}

export async function createPost(data: PostFormData) {
  const user = await getSessionUser();
  const slug = slugify(data.title);
  const readingTime = calculateReadingTime(data.content);
  const postId = randomUUID();
  const now = new Date();

  const existingPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug));

  const existing = existingPosts[0];
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  await db.insert(posts).values({
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
  });

  if (data.tagNames.length > 0) {
    const tagIds = await ensureTagsExist(data.tagNames);
    for (const tagId of tagIds) {
      await db.insert(postTags).values({ postId, tagId });
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

  const postResults = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)));

  const post = postResults[0];
  if (!post) throw new Error("Post not found or unauthorized");

  const wasPublished = post.published;

  await db
    .update(posts)
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
    .where(eq(posts.id, postId));

  await db.delete(postTags).where(eq(postTags.postId, postId));

  if (data.tagNames.length > 0) {
    const tagIds = await ensureTagsExist(data.tagNames);
    for (const tagId of tagIds) {
      await db.insert(postTags).values({ postId, tagId });
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

  const postResults = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)));

  const post = postResults[0];
  if (!post) throw new Error("Post not found or unauthorized");

  await db.delete(postTags).where(eq(postTags.postId, postId));
  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfile(data: {
  name: string;
  image?: string;
  bio?: string;
}) {
  const user = await getSessionUser();

  const name = data.name.trim();
  if (!name || name.length > 100) {
    throw new Error("Name is required and must be under 100 characters.");
  }

  const bio = data.bio?.trim() || null;
  if (bio && bio.length > 500) {
    throw new Error("Bio must be under 500 characters.");
  }

  const image = data.image?.trim() || null;

  await db
    .update(users)
    .set({ name, image, bio })
    .where(eq(users.id, user.id));

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/dashboard");
  revalidatePath(`/authors/${user.githubUsername}`);
}
