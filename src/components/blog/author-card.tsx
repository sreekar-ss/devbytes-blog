import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

type AuthorCardProps = {
    author: {
        name: string;
        image: string | null;
        bio: string | null;
        githubUsername: string;
    };
};

export function AuthorCard({ author }: AuthorCardProps) {
    return (
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <Link
                href={`/authors/${author.githubUsername}`}
                className="glass-card p-6 flex items-start gap-4 hover:border-[var(--accent)] transition-colors block"
            >
                {author.image ? (
                    <Image
                        src={author.image}
                        alt={author.name}
                        width={56}
                        height={56}
                        className="rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-[var(--surface)] flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-[var(--muted)]" />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                        written by
                    </p>
                    <p className="font-medium text-base">{author.name}</p>
                    {author.bio && (
                        <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
                            {author.bio}
                        </p>
                    )}
                </div>
            </Link>
        </div>
    );
}
