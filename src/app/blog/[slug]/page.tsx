import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries";
import { renderMDX, extractHeadings } from "@/lib/mdx";
import { formatDate, absoluteUrl, siteConfig } from "@/lib/utils";
import { DifficultyBadge } from "@/components/blog/difficulty-badge";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ReadingProgress } from "@/components/blog/reading-progress";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  if (!data) return {};

  const { post, author } = data;

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [author.name],
      url: absoluteUrl(`/blog/${post.slug}`),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPostBySlug(slug);

  if (!data || !data.post.published) {
    notFound();
  }

  const { post, author, tags } = data;
  const content = await renderMDX(post.content);
  const headings = extractHeadings(post.content);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: author.name,
      url: absoluteUrl(`/authors/${author.githubUsername}`),
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: absoluteUrl(`/blog/${post.slug}`),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    keywords: tags.map((t) => t.name),
    articleSection: "Technology",
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${post.readingTime}M`,
  };

  return (
    <>
      <ReadingProgress />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-6xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {/* Header */}
        <header className="max-w-3xl mb-10">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              >
                {tag.name}
              </Link>
            ))}
            <DifficultyBadge difficulty={post.difficulty} />
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* Author & Meta */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href={`/authors/${author.githubUsername}`}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--surface)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--muted)]" />
                </div>
              )}
              <span className="text-sm font-medium">{author.name}</span>
            </Link>
            <span className="text-[var(--border)]">|</span>
            <span className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
              <Calendar className="w-4 h-4" />
              {post.publishedAt
                ? formatDate(post.publishedAt)
                : formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
              <Clock className="w-4 h-4" />
              {post.readingTime} min read
            </span>
          </div>
        </header>

        {/* Content + TOC layout */}
        <div className="flex gap-12">
          {/* Main content */}
          <div className="flex-1 max-w-3xl prose-content">{content}</div>

          {/* Sidebar TOC - desktop only */}
          {headings.length > 2 && (
            <aside className="hidden xl:block w-64 shrink-0">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </article>
    </>
  );
}

