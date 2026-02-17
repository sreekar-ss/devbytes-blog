import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { randomUUID } from "crypto";

const dbPath = path.join(process.cwd(), "sqlite.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("Seeding database...");

  // Seed users
  const userId1 = randomUUID();
  const userId2 = randomUUID();

  db.insert(schema.users)
    .values([
      {
        id: userId1,
        name: "Sreekar Siddula",
        email: "sreekar@example.com",
        image: "https://avatars.githubusercontent.com/u/1?v=4",
        githubUsername: "sreekarsiddula",
        bio: "Full-stack developer passionate about building modern web applications.",
        role: "admin",
        createdAt: new Date(),
      },
      {
        id: userId2,
        name: "Alex Dev",
        email: "alex@example.com",
        image: "https://avatars.githubusercontent.com/u/2?v=4",
        githubUsername: "alexdev",
        bio: "Backend engineer who loves distributed systems and clean code.",
        role: "author",
        createdAt: new Date(),
      },
    ])
    .run();

  // Seed tags
  const tagIds = {
    react: randomUUID(),
    nextjs: randomUUID(),
    typescript: randomUUID(),
    rust: randomUUID(),
    webdev: randomUUID(),
    devops: randomUUID(),
    ai: randomUUID(),
    database: randomUUID(),
  };

  db.insert(schema.tags)
    .values([
      { id: tagIds.react, name: "React", slug: "react" },
      { id: tagIds.nextjs, name: "Next.js", slug: "nextjs" },
      { id: tagIds.typescript, name: "TypeScript", slug: "typescript" },
      { id: tagIds.rust, name: "Rust", slug: "rust" },
      { id: tagIds.webdev, name: "Web Dev", slug: "web-dev" },
      { id: tagIds.devops, name: "DevOps", slug: "devops" },
      { id: tagIds.ai, name: "AI/ML", slug: "ai-ml" },
      { id: tagIds.database, name: "Databases", slug: "databases" },
    ])
    .run();

  // Seed posts
  const post1Id = randomUUID();
  const post2Id = randomUUID();
  const post3Id = randomUUID();

  const now = new Date();

  db.insert(schema.posts)
    .values([
      {
        id: post1Id,
        slug: "building-type-safe-apis-with-nextjs",
        title: "Building Type-Safe APIs with Next.js 15 and Drizzle ORM",
        excerpt:
          "Learn how to build fully type-safe API routes in Next.js 15 using Drizzle ORM, from schema definition to runtime validation.",
        content: `# Building Type-Safe APIs with Next.js 15 and Drizzle ORM

In the modern web development landscape, type safety isn't just a nice-to-have — it's essential. This guide walks you through building fully type-safe API routes using Next.js 15's App Router and Drizzle ORM.

## Why Type Safety Matters

When your database schema, API handlers, and frontend components all share the same type definitions, entire categories of bugs simply vanish. No more \`undefined is not a function\` in production.

## Setting Up Drizzle ORM

First, let's define our schema:

\`\`\`typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
\`\`\`

## Creating Type-Safe API Routes

With Next.js 15 App Router, we can create API routes that leverage our Drizzle types:

\`\`\`typescript
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const allPosts = await db.select().from(posts);
  return NextResponse.json(allPosts);
}
\`\`\`

The beauty here is that \`allPosts\` is fully typed — your IDE knows exactly what fields are available.

## Runtime Validation

While TypeScript gives us compile-time safety, we also need runtime validation for incoming data. Here's how to add that layer:

\`\`\`typescript
export async function POST(request: Request) {
  const body = await request.json();
  
  if (!body.title || !body.content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const newPost = await db.insert(posts).values({
    id: crypto.randomUUID(),
    title: body.title,
    content: body.content,
    createdAt: new Date(),
  }).returning();

  return NextResponse.json(newPost[0], { status: 201 });
}
\`\`\`

## Conclusion

Type-safe APIs aren't just about preventing bugs — they're about developer experience. When your entire stack speaks the same type language, development becomes faster and more enjoyable.`,
        authorId: userId1,
        difficulty: "intermediate",
        readingTime: 8,
        published: true,
        featured: true,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: post2Id,
        slug: "rust-for-javascript-developers",
        title: "Rust for JavaScript Developers: A Practical Introduction",
        excerpt:
          "A hands-on guide to learning Rust, written specifically for developers coming from the JavaScript/TypeScript ecosystem.",
        content: `# Rust for JavaScript Developers: A Practical Introduction

If you're a JavaScript developer curious about Rust, you're in the right place. This guide maps Rust concepts to things you already know.

## Variables: \`let\` vs \`let mut\`

In JavaScript, \`let\` creates a mutable variable. In Rust, \`let\` creates an **immutable** variable by default:

\`\`\`rust
let name = "world";      // immutable (like JS const)
let mut count = 0;        // mutable (like JS let)
count += 1;               // this works
// name = "hello";        // this would NOT compile
\`\`\`

## No Null, No Undefined

Rust doesn't have \`null\` or \`undefined\`. Instead, it uses \`Option<T>\`:

\`\`\`rust
fn find_user(id: u32) -> Option<String> {
    if id == 1 {
        Some("Alice".to_string())
    } else {
        None
    }
}

match find_user(1) {
    Some(name) => println!("Found: {}", name),
    None => println!("User not found"),
}
\`\`\`

This is similar to TypeScript's strict null checks, but enforced at the language level.

## Error Handling: \`Result\` instead of \`try/catch\`

\`\`\`rust
use std::fs;

fn read_config() -> Result<String, std::io::Error> {
    fs::read_to_string("config.toml")
}

fn main() {
    match read_config() {
        Ok(content) => println!("Config: {}", content),
        Err(e) => eprintln!("Error reading config: {}", e),
    }
}
\`\`\`

## Ownership: The Big Concept

This is where Rust diverges most from JavaScript. Every value has exactly one owner:

\`\`\`rust
let s1 = String::from("hello");
let s2 = s1;  // s1 is MOVED to s2
// println!("{}", s1);  // ERROR: s1 is no longer valid
println!("{}", s2);     // This works
\`\`\`

Think of it like transferring a file instead of copying it. This is how Rust avoids garbage collection while preventing memory leaks.

## Conclusion

Rust has a steeper learning curve than JavaScript, but the payoff is enormous: zero-cost abstractions, memory safety without GC, and incredibly reliable software.`,
        authorId: userId2,
        difficulty: "beginner",
        readingTime: 12,
        published: true,
        featured: true,
        publishedAt: new Date(now.getTime() - 86400000),
        createdAt: new Date(now.getTime() - 86400000),
        updatedAt: new Date(now.getTime() - 86400000),
      },
      {
        id: post3Id,
        slug: "docker-compose-for-local-development",
        title: "Docker Compose Patterns for Local Development",
        excerpt:
          "Stop fighting environment setup. Learn Docker Compose patterns that make local development reproducible and painless.",
        content: `# Docker Compose Patterns for Local Development

Every developer has experienced it: "works on my machine." Docker Compose solves this by making your development environment reproducible.

## The Basic Pattern

\`\`\`yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      - db
  
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
\`\`\`

## Hot Reload with Volumes

The key to a good DX is the volume mount:

\`\`\`yaml
volumes:
  - .:/app           # Mount your code
  - /app/node_modules # But keep node_modules in the container
\`\`\`

This gives you hot reload while keeping platform-specific native modules correctly compiled for the container's OS.

## Multi-Service Development

For microservice architectures, compose files become your orchestration layer:

\`\`\`yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  api:
    build: ./api
    ports: ["4000:4000"]
    depends_on: [db, redis]
  
  worker:
    build: ./worker
    depends_on: [db, redis]
  
  db:
    image: postgres:16-alpine
  
  redis:
    image: redis:7-alpine
\`\`\`

## Health Checks

Don't just use \`depends_on\` — add health checks:

\`\`\`yaml
db:
  image: postgres:16-alpine
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U user"]
    interval: 5s
    timeout: 5s
    retries: 5

app:
  depends_on:
    db:
      condition: service_healthy
\`\`\`

## Conclusion

Docker Compose transforms local development from a setup nightmare into a single \`docker compose up\` command. Invest the time to get it right — your team will thank you.`,
        authorId: userId1,
        difficulty: "beginner",
        readingTime: 6,
        published: true,
        featured: false,
        publishedAt: new Date(now.getTime() - 172800000),
        createdAt: new Date(now.getTime() - 172800000),
        updatedAt: new Date(now.getTime() - 172800000),
      },
    ])
    .run();

  // Seed post tags
  db.insert(schema.postTags)
    .values([
      { postId: post1Id, tagId: tagIds.nextjs },
      { postId: post1Id, tagId: tagIds.typescript },
      { postId: post1Id, tagId: tagIds.database },
      { postId: post2Id, tagId: tagIds.rust },
      { postId: post2Id, tagId: tagIds.webdev },
      { postId: post3Id, tagId: tagIds.devops },
      { postId: post3Id, tagId: tagIds.webdev },
    ])
    .run();

  console.log("Database seeded successfully!");
  console.log("  - 2 users");
  console.log("  - 3 posts");
  console.log("  - 8 tags");
  console.log("  - 7 post-tag associations");

  sqlite.close();
}

seed().catch(console.error);
