import Link from "next/link";
import { Rss } from "lucide-react";
import { siteConfig } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-fuchsia-500 flex items-center justify-center">
                <span className="text-white font-mono font-bold text-sm">
                  {"</>"}
                </span>
              </div>
              <span className="text-lg font-medium tracking-tight">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-[var(--muted)] text-sm max-w-xs leading-relaxed mb-4">
              Documenting the shift from writing code to directing intent.
              Magnitude is AI output; direction is human architecture.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <a
                href="https://x.com/thevector_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--foreground)] transition-colors"
              >
                @thevector_dev
              </a>
              <span className="text-[var(--border)]">·</span>
              <a
                href="https://instagram.com/thevector.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--foreground)] transition-colors"
              >
                @thevector.dev
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--muted)] mb-4">
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
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--muted)] mb-4">
              For machines
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

        <div className="mt-10 pt-6 border-t border-[var(--border)] space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--muted)]">
              &copy; {new Date().getFullYear()} {siteConfig.name}. Built with
              Next.js.
            </p>
            <p className="text-xs text-[var(--muted)] font-mono">
              thevector.dev
            </p>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed text-center sm:text-left max-w-3xl">
            This is a personal, non-profit archive created for educational and
            professional development purposes. It does not generate revenue,
            offer services, or constitute a business entity. All views expressed
            are strictly my own.
          </p>
        </div>
      </div>
    </footer>
  );
}
