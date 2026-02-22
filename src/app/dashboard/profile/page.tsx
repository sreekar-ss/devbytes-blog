import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata = {
    title: "edit profile | the vector",
};

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/signin");

    const sessionUser = session.user as Record<string, unknown>;
    const githubUsername = sessionUser.githubUsername as string;

    const dbUsers = await db
        .select()
        .from(users)
        .where(eq(users.githubUsername, githubUsername));

    const dbUser = dbUsers[0];
    if (!dbUser) redirect("/auth/signin");

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                back to dashboard
            </Link>

            <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">
                edit profile
            </h1>
            <p className="text-[var(--muted)] text-sm mb-8">
                update your display name, photo, and bio. your bio appears at the end of your articles.
            </p>

            <div className="glass-card p-6 md:p-8">
                <ProfileForm
                    user={{
                        name: dbUser.name,
                        image: dbUser.image,
                        bio: dbUser.bio,
                        githubUsername: dbUser.githubUsername,
                    }}
                />
            </div>
        </div>
    );
}
