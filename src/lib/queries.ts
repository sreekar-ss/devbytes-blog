import { db } from "./db";
import { posts, users, tags, postTags } from "./db/schema";
import { eq, desc, and, like, inArray } from "drizzle-orm";

export type PostWithAuthor = {
  post: typeof posts.$inferSelect;
  author: typeof users.$inferSelect;
  tags: (typeof tags.$inferSelect)[];
};

export async function getPublishedPosts(): Promise<PostWithAuthor[]> {
  const results = db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt))
    .all();

  return Promise.all(
    results.map(async (row) => {
      const postTagRows = db
        .select()
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, row.posts.id))
        .all();

      return {
        post: row.posts,
        author: row.users,
        tags: postTagRows.map((pt) => pt.tags),
      };
    })
  );
}

export async function getFeaturedPosts(): Promise<PostWithAuthor[]> {
  const results = db
    .select()
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.featured, true)))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt))
    .all();

  return Promise.all(
    results.map(async (row) => {
      const postTagRows = db
        .select()
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, row.posts.id))
        .all();

      return {
        post: row.posts,
        author: row.users,
        tags: postTagRows.map((pt) => pt.tags),
      };
    })
  );
}

export async function getPostBySlug(
  slug: string
): Promise<PostWithAuthor | null> {
  const result = db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .innerJoin(users, eq(posts.authorId, users.id))
    .get();

  if (!result) return null;

  const postTagRows = db
    .select()
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, result.posts.id))
    .all();

  return {
    post: result.posts,
    author: result.users,
    tags: postTagRows.map((pt) => pt.tags),
  };
}

export async function getPostsByAuthor(
  githubUsername: string
): Promise<PostWithAuthor[]> {
  const author = db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername))
    .get();

  if (!author) return [];

  const results = db
    .select()
    .from(posts)
    .where(and(eq(posts.authorId, author.id), eq(posts.published, true)))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt))
    .all();

  return Promise.all(
    results.map(async (row) => {
      const postTagRows = db
        .select()
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, row.posts.id))
        .all();

      return {
        post: row.posts,
        author: row.users,
        tags: postTagRows.map((pt) => pt.tags),
      };
    })
  );
}

export async function getPostsByTag(tagSlug: string): Promise<PostWithAuthor[]> {
  const tag = db
    .select()
    .from(tags)
    .where(eq(tags.slug, tagSlug))
    .get();

  if (!tag) return [];

  const postIds = db
    .select({ postId: postTags.postId })
    .from(postTags)
    .where(eq(postTags.tagId, tag.id))
    .all()
    .map((r) => r.postId);

  if (postIds.length === 0) return [];

  const results = db
    .select()
    .from(posts)
    .where(and(eq(posts.published, true), inArray(posts.id, postIds)))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt))
    .all();

  return Promise.all(
    results.map(async (row) => {
      const postTagRows = db
        .select()
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, row.posts.id))
        .all();

      return {
        post: row.posts,
        author: row.users,
        tags: postTagRows.map((pt) => pt.tags),
      };
    })
  );
}

export async function searchPosts(query: string): Promise<PostWithAuthor[]> {
  const results = db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.published, true),
        like(posts.title, `%${query}%`)
      )
    )
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.publishedAt))
    .all();

  return Promise.all(
    results.map(async (row) => {
      const postTagRows = db
        .select()
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, row.posts.id))
        .all();

      return {
        post: row.posts,
        author: row.users,
        tags: postTagRows.map((pt) => pt.tags),
      };
    })
  );
}

export async function getAllTags() {
  return db.select().from(tags).all();
}

export async function getAuthorByUsername(githubUsername: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.githubUsername, githubUsername))
    .get();
}

export async function getPostsByAuthorId(
  authorId: string,
  includeUnpublished = false
) {
  const conditions = includeUnpublished
    ? eq(posts.authorId, authorId)
    : and(eq(posts.authorId, authorId), eq(posts.published, true));

  const results = db
    .select()
    .from(posts)
    .where(conditions)
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .all();

  return Promise.all(
    results.map(async (row) => {
      const postTagRows = db
        .select()
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, row.posts.id))
        .all();

      return {
        post: row.posts,
        author: row.users,
        tags: postTagRows.map((pt) => pt.tags),
      };
    })
  );
}

