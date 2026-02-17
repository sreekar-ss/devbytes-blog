import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/queries";
import { siteConfig, absoluteUrl } from "@/lib/utils";

export async function GET() {
  const posts = await getPublishedPosts();

  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `This file provides an index of all content on ${siteConfig.name} for AI agents and LLMs.`,
    `For full content, see: ${absoluteUrl("/llms-full.txt")}`,
    `For structured data, see: ${absoluteUrl("/api/posts")}`,
    "",
    "## Articles",
    "",
  ];

  for (const { post, author, tags } of posts) {
    const tagStr = tags.map((t) => t.name).join(", ");
    lines.push(
      `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})` +
        ` | by ${author.name}` +
        ` | ${post.difficulty}` +
        ` | ${post.readingTime} min read` +
        (tagStr ? ` | Tags: ${tagStr}` : "")
    );
    lines.push(`  ${post.excerpt}`);
    lines.push("");
  }

  lines.push("## API Endpoints");
  lines.push("");
  lines.push(
    `- All posts (JSON): ${absoluteUrl("/api/posts")}`
  );
  lines.push(
    `- Single post (JSON): ${absoluteUrl("/api/posts/{slug}")}`
  );
  lines.push(
    `- Full content (text): ${absoluteUrl("/llms-full.txt")}`
  );
  lines.push(`- RSS Feed: ${absoluteUrl("/feed.xml")}`);
  lines.push("");

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

