import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  githubUsername: text("github_username").notNull().unique(),
  bio: text("bio"),
  role: text("role", { enum: ["admin", "author"] })
    .notNull()
    .default("author"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  difficulty: text("difficulty", {
    enum: ["beginner", "intermediate", "advanced"],
  })
    .notNull()
    .default("intermediate"),
  readingTime: integer("reading_time").notNull().default(5),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const postTags = sqliteTable("post_tags", {
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

