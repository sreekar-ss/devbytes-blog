import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/queries";
import { siteConfig } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const postUrls = posts.map(({ post }) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Get unique authors
  const authors = [...new Set(posts.map((p) => p.author.githubUsername))];
  const authorUrls = authors.map((username) => ({
    url: `${siteConfig.url}/authors/${username}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...postUrls,
    ...authorUrls,
  ];
}

