"use client";

import { useEffect, useState } from "react";

type Heading = {
  text: string;
  level: number;
  id: string;
};

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1" aria-label="Table of Contents">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
        On this page
      </h4>
      {headings
        .filter((h) => h.level <= 3)
        .map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-sm py-1 transition-colors border-l-2 ${
              heading.level === 2 ? "pl-3" : heading.level === 3 ? "pl-6" : "pl-3"
            } ${
              activeId === heading.id
                ? "border-[var(--accent)] text-[var(--foreground)] font-medium"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
            }`}
          >
            {heading.text}
          </a>
        ))}
    </nav>
  );
}

