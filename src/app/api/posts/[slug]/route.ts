import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/queries";
import { absoluteUrl, siteConfig } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await getPostBySlug(slug);

  if (!data || !data.post.published) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404 }
    );
  }

  const { post, author, tags } = data;

  const response = {
    meta: {
      source: siteConfig.name,
      generatedAt: new Date().toISOString(),
    },
    post: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      url: absoluteUrl(`/blog/${post.slug}`),
      author: {
        name: author.name,
        githubUsername: author.githubUsername,
        profileUrl: absoluteUrl(`/authors/${author.githubUsername}`),
      },
      difficulty: post.difficulty,
      readingTime: post.readingTime,
      wordCount: post.content.split(/\s+/).length,
      tags: tags.map((t) => ({ name: t.name, slug: t.slug })),
      publishedAt: post.publishedAt?.toISOString() || null,
      updatedAt: post.updatedAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

