import Link from "next/link";
import { ArrowRight, Terminal, Compass, Layers, Cpu, Rss } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { getFeaturedPosts, getPublishedPosts } from "@/lib/queries";

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts();
  const recentPosts = await getPublishedPosts();
  const nonFeatured = recentPosts.filter(
    (p) => !featuredPosts.some((f) => f.post.id === p.post.id)
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--muted)] mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              vector_001 — now live
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 animate-fade-in stagger-1">
              architecture over{" "}
              <span className="gradient-text">syntax.</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--muted)] leading-relaxed mb-8 max-w-2xl animate-fade-in stagger-2">
              AI writes the code now. the hard part is knowing{" "}
              <span className="text-[var(--foreground)]">what to build and why.</span>{" "}
              the vector is where I break down the architectural
              decisions, trade-offs, and patterns that still need a
              human behind the wheel.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in stagger-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                explore the blogs
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/llms.txt"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] font-medium hover:bg-[var(--surface)] transition-colors font-mono text-sm"
              >
                <Terminal className="w-4 h-4" />
                /llms.txt
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Pillars */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Compass,
                label: "system patterns",
                desc: "human vs. AI architecture",
              },
              {
                icon: Layers,
                label: "the tech stack",
                desc: "tools that amplify intent",
              },
              {
                icon: Cpu,
                label: "meta-dev",
                desc: "the evolving senior engineer",
              },
              {
                icon: Rss,
                label: "AI-friendly",
                desc: "llms.txt & structured data",
              },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.label}</p>
                  <p className="text-xs text-[var(--muted)]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light tracking-tight">featured</h2>
              <p className="text-[var(--muted)] text-sm mt-1">
                handpicked entries worth reading
              </p>
            </div>
          </div>
          <div className="grid gap-6">
            {featuredPosts.map((item) => (
              <PostCard key={item.post.id} {...item} featured />
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      {nonFeatured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light tracking-tight">
                recent entries
              </h2>
              <p className="text-[var(--muted)] text-sm mt-1">
                latest from the blogs
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              view all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonFeatured.slice(0, 6).map((item) => (
              <PostCard key={item.post.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* CTA — The Vector Definition */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="glass-card p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--muted)] mb-6">
              <Cpu className="w-3.5 h-3.5" />
              magnitude + direction
            </div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
              AI output is magnitude.{" "}
              <span className="gradient-text">human intent is direction.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto mb-8 leading-relaxed">
              every entry in this archive is available as structured data —
              JSON API, llms.txt index, and RSS feed. built so that both
              humans and AI agents can discover and consume content
              efficiently.
            </p>
            <div className="flex flex-wrap justify-center gap-4 font-mono text-sm">
              <Link
                href="/llms.txt"
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
              >
                /llms.txt
              </Link>
              <Link
                href="/api/posts"
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
              >
                /api/posts
              </Link>
              <Link
                href="/feed.xml"
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
              >
                /feed.xml
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
