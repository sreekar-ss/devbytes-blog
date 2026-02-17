import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/queries";
import { absoluteUrl, siteConfig } from "@/lib/utils";

export async function GET() {
  const posts = await getPublishedPosts();

  const data = {
    meta: {
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      totalPosts: posts.length,
      generatedAt: new Date().toISOString(),
    },
    posts: posts.map(({ post, author, tags }) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      url: absoluteUrl(`/blog/${post.slug}`),
      apiUrl: absoluteUrl(`/api/posts/${post.slug}`),
      author: {
        name: author.name,
        githubUsername: author.githubUsername,
        profileUrl: absoluteUrl(`/authors/${author.githubUsername}`),
      },
      difficulty: post.difficulty,
      readingTime: post.readingTime,
      tags: tags.map((t) => ({ name: t.name, slug: t.slug })),
      publishedAt: post.publishedAt?.toISOString() || null,
      updatedAt: post.updatedAt.toISOString(),
    })),
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

