import { db } from "./db";
import { posts, users, tags, postTags } from "./db/schema";
import { eq, desc, and, like, inArray } from "drizzle-orm";

export type PostWithAuthor = {
  post: typeof posts.$inferSelect;
  author: typeof users.$inferSelect;
  tags: (typeof tags.$inferSelect)[];
};

async function getTagsForPost(postId: string) {
  const postTagRows = await db
    .select()
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId));

  return postTagRows.map((pt) => pt.tags);
}

export async function getPublishedPosts(): Promise<PostWithAuthor[]> {
  const results = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt));

  return Promise.all(
    results.map(async (row) => ({
      post: row.posts,
      author: row.users,
      tags: await getTagsForPost(row.posts.id),
    }))
  );
}

export async function getFeaturedPosts(): Promise<PostWithAuthor[]> {
  const results = await db
    .select()
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.featured, true)))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt));

  return Promise.all(
    results.map(async (row) => ({
      post: row.posts,
      author: row.users,
      tags: await getTagsForPost(row.posts.id),
    }))
  );
}

export async function getPostBySlug(
  slug: string
): Promise<PostWithAuthor | null> {
  const results = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .innerJoin(users, eq(posts.authorId, users.id));

  const result = results[0];
  if (!result) return null;

  return {
    post: result.posts,
    author: result.users,
    tags: await getTagsForPost(result.posts.id),
  };
}

export async function getPostsByAuthor(
  githubUsername: string
): Promise<PostWithAuthor[]> {
  const authorResults = await db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername));

  const author = authorResults[0];
  if (!author) return [];

  const results = await db
    .select()
    .from(posts)
    .where(and(eq(posts.authorId, author.id), eq(posts.published, true)))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt));

  return Promise.all(
    results.map(async (row) => ({
      post: row.posts,
      author: row.users,
      tags: await getTagsForPost(row.posts.id),
    }))
  );
}

export async function getPostsByTag(tagSlug: string): Promise<PostWithAuthor[]> {
  const tagResults = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, tagSlug));

  const tag = tagResults[0];
  if (!tag) return [];

  const postIdRows = await db
    .select({ postId: postTags.postId })
    .from(postTags)
    .where(eq(postTags.tagId, tag.id));

  const postIds = postIdRows.map((r) => r.postId);
  if (postIds.length === 0) return [];

  const results = await db
    .select()
    .from(posts)
    .where(and(eq(posts.published, true), inArray(posts.id, postIds)))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt));

  return Promise.all(
    results.map(async (row) => ({
      post: row.posts,
      author: row.users,
      tags: await getTagsForPost(row.posts.id),
    }))
  );
}

export async function searchPosts(query: string): Promise<PostWithAuthor[]> {
  const results = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.published, true),
        like(posts.title, `%${query}%`)
      )
    )
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt));

  return Promise.all(
    results.map(async (row) => ({
      post: row.posts,
      author: row.users,
      tags: await getTagsForPost(row.posts.id),
    }))
  );
}

export async function getAllTags() {
  return db.select().from(tags);
}

export async function getAuthorByUsername(githubUsername: string) {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername));

  return results[0] || undefined;
}

export async function getPostsByAuthorId(
  authorId: string,
  includeUnpublished = false
) {
  const conditions = includeUnpublished
    ? eq(posts.authorId, authorId)
    : and(eq(posts.authorId, authorId), eq(posts.published, true));

  const results = await db
    .select()
    .from(posts)
    .where(conditions)
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt));

  return Promise.all(
    results.map(async (row) => ({
      post: row.posts,
      author: row.users,
      tags: await getTagsForPost(row.posts.id),
    }))
  );
}
