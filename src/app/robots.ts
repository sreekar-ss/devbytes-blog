import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
      },
      {
        userAgent: "Anthropic-AI",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

