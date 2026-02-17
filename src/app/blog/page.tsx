import { Suspense } from "react";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedPosts, getAllTags } from "@/lib/queries";
import { BlogFilters } from "@/components/blog/blog-filters";

export const metadata = {
  title: "Blog",
  description: "Browse all technical articles on DevBytes.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; difficulty?: string; q?: string }>;
}) {
  const params = await searchParams;
  const allPosts = await getPublishedPosts();
  const allTags = await getAllTags();

  // Filter posts
  let filtered = allPosts;

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.post.title.toLowerCase().includes(query) ||
        p.post.excerpt.toLowerCase().includes(query)
    );
  }

  if (params.tag) {
    filtered = filtered.filter((p) =>
      p.tags.some((t) => t.slug === params.tag)
    );
  }

  if (params.difficulty) {
    filtered = filtered.filter(
      (p) => p.post.difficulty === params.difficulty
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Blog
        </h1>
        <p className="text-[var(--muted)] text-lg">
          Technical articles on software development, engineering practices,
          and more.
        </p>
      </div>

      <Suspense fallback={null}>
        <BlogFilters
          tags={allTags}
          activeTag={params.tag}
          activeDifficulty={params.difficulty}
          query={params.q}
        />
      </Suspense>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--muted)] text-lg">
            No posts found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <PostCard key={item.post.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

