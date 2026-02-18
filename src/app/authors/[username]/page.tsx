import { notFound } from "next/navigation";
import Image from "next/image";
import { Github, User } from "lucide-react";
import { getAuthorByUsername, getPostsByAuthor } from "@/lib/queries";
import { PostCard } from "@/components/blog/post-card";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) return {};

  return {
    title: `${author.name} - Author`,
    description: author.bio || `Posts by ${author.name} on the vector.`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);

  if (!author) {
    notFound();
  }

  const posts = await getPostsByAuthor(username);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Author Header */}
      <div className="flex items-start gap-6 mb-12">
        {author.image ? (
          <Image
            src={author.image}
            alt={author.name}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[var(--surface)] flex items-center justify-center">
            <User className="w-8 h-8 text-[var(--muted)]" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            {author.name}
          </h1>
          <a
            href={`https://github.com/${author.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3"
          >
            <Github className="w-4 h-4" />@{author.githubUsername}
          </a>
          {author.bio && (
            <p className="text-[var(--muted)] max-w-lg">{author.bio}</p>
          )}
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-xl font-bold tracking-tight mb-6">
        Posts by {author.name}{" "}
        <span className="text-[var(--muted)] font-normal">
          ({posts.length})
        </span>
      </h2>

      {posts.length === 0 ? (
        <p className="text-[var(--muted)]">No published posts yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((item) => (
            <PostCard key={item.post.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

