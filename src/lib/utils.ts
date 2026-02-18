export function cn(
  ...inputs: (string | number | boolean | undefined | null | (string | number | boolean | undefined | null)[])[]
): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .join(" ");
}

export function formatDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function getExcerpt(content: string, maxLength: number = 160): string {
  // Strip markdown syntax
  const plain = content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path}`;
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "the vector",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "architecture over syntax. a personal archive documenting the shift from writing code to directing intent.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://thevector.dev",
};
