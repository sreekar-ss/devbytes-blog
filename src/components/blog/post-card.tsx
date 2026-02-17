import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";
import type { PostWithAuthor } from "@/lib/queries";

export function PostCard({
  post,
  author,
  tags,
  featured = false,
}: PostWithAuthor & { featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article
        className={`glass-card p-6 h-full flex flex-col ${
          featured ? "md:flex-row md:gap-8" : ""
        }`}
      >
        {/* Cover image for featured posts */}
        {featured && post.coverImage && (
          <div className="md:w-1/3 mb-4 md:mb-0 rounded-lg overflow-hidden bg-[var(--surface)]">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={400}
              height={250}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)]"
              >
                {tag.name}
              </span>
            ))}
            <DifficultyBadge difficulty={post.difficulty} />
          </div>

          {/* Title */}
          <h3
            className={`font-bold tracking-tight mb-2 group-hover:text-[var(--accent)] transition-colors ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-4 flex-1">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              {author.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt
                ? formatDate(post.publishedAt)
                : formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

