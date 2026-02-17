import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ],
      },
    },
    components: {
      pre: (props: React.ComponentProps<"pre">) => {
        return <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-5 my-6 text-sm leading-7 font-mono" {...props} />;
      },
      code: (props: React.ComponentProps<"code"> & { className?: string }) => {
        const isInline = !props.className;
        if (isInline) {
          return <code className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-1.5 py-0.5 text-[0.875em] font-mono font-medium" {...props} />;
        }
        return <code {...props} />;
      },
    },
  });

  return content;
}

export function extractHeadings(
  markdown: string
): { text: string; level: number; id: string }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { text: string; level: number; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].replace(/\*\*|__|\*|_|`/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({
      text,
      level: match[1].length,
      id,
    });
  }

  return headings;
}
