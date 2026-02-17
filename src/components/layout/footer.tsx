import Link from "next/link";
import { Rss } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-mono font-bold text-sm">
                  {"</>"}
                </span>
              </div>
              <span className="text-lg font-bold tracking-tight">
                DevBytes
              </span>
            </div>
            <p className="text-[var(--muted)] text-sm max-w-xs leading-relaxed">
              A modern technical blog for developers, by developers. Sharing
              insights on software engineering, one byte at a time.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--muted)] mb-4">
              Navigate
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* AI / Machine */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--muted)] mb-4">
              For Machines
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/llms.txt"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors font-mono"
                >
                  llms.txt
                </Link>
              </li>
              <li>
                <Link
                  href="/llms-full.txt"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors font-mono"
                >
                  llms-full.txt
                </Link>
              </li>
              <li>
                <Link
                  href="/api/posts"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors font-mono"
                >
                  /api/posts
                </Link>
              </li>
              <li>
                <Link
                  href="/feed.xml"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1.5"
                >
                  <Rss className="w-3.5 h-3.5" />
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} DevBytes. Built with Next.js.
          </p>
          <p className="text-xs text-[var(--muted)] font-mono">
            Human-friendly &bull; AI-friendly
          </p>
        </div>
      </div>
    </footer>
  );
}

