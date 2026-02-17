import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/queries";
import { siteConfig, absoluteUrl } from "@/lib/utils";

export async function GET() {
  const posts = await getPublishedPosts();

  const sections: string[] = [
    `# ${siteConfig.name} — Full Content`,
    "",
    `> ${siteConfig.description}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Total articles: ${posts.length}`,
    "",
    "---",
    "",
  ];

  for (const { post, author, tags } of posts) {
    const tagStr = tags.map((t) => t.name).join(", ");
    sections.push(`# ${post.title}`);
    sections.push("");
    sections.push(`URL: ${absoluteUrl(`/blog/${post.slug}`)}`);
    sections.push(`Author: ${author.name} (@${author.githubUsername})`);
    sections.push(`Difficulty: ${post.difficulty}`);
    sections.push(`Reading time: ${post.readingTime} min`);
    sections.push(`Tags: ${tagStr || "none"}`);
    sections.push(
      `Published: ${post.publishedAt?.toISOString() || "N/A"}`
    );
    sections.push("");
    sections.push(post.content);
    sections.push("");
    sections.push("---");
    sections.push("");
  }

  return new NextResponse(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

