"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useCallback } from "react";
import type { Tag } from "@/lib/db/schema";

export function BlogFilters({
  tags,
  activeTag,
  activeDifficulty,
  query,
}: {
  tags: Tag[];
  activeTag?: string;
  activeDifficulty?: string;
  query?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query || "");

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/blog?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("q", search || null);
  };

  const clearFilters = () => {
    setSearch("");
    router.push("/blog");
  };

  const hasActiveFilters = activeTag || activeDifficulty || query;

  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]"
        />
      </form>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() =>
              updateParams("tag", activeTag === tag.slug ? null : tag.slug)
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTag === tag.slug
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Difficulty Filters */}
      <div className="flex flex-wrap gap-2">
        {(["beginner", "intermediate", "advanced"] as const).map((level) => (
          <button
            key={level}
            onClick={() =>
              updateParams(
                "difficulty",
                activeDifficulty === level ? null : level
              )
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              activeDifficulty === level
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}

