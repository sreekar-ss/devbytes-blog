"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateProfile } from "@/app/dashboard/actions";
import { User } from "lucide-react";

type ProfileFormProps = {
    user: {
        name: string;
        image: string | null;
        bio: string | null;
        githubUsername: string;
    };
};

export function ProfileForm({ user }: ProfileFormProps) {
    const [name, setName] = useState(user.name);
    const [image, setImage] = useState(user.image || "");
    const [bio, setBio] = useState(user.bio || "");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);

        startTransition(async () => {
            try {
                await updateProfile({ name, image: image || undefined, bio: bio || undefined });
                setMessage({ type: "success", text: "profile updated." });
            } catch (err) {
                setMessage({
                    type: "error",
                    text: err instanceof Error ? err.message : "something went wrong.",
                });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center">
                        <User className="w-6 h-6 text-[var(--muted)]" />
                    </div>
                )}
                <div>
                    <p className="font-medium">{name || user.githubUsername}</p>
                    <p className="text-sm text-[var(--muted)]">@{user.githubUsername}</p>
                </div>
            </div>

            {/* Name */}
            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1.5"
                >
                    display name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
                />
            </div>

            {/* Image URL */}
            <div>
                <label
                    htmlFor="image"
                    className="block text-sm font-medium mb-1.5"
                >
                    profile image URL
                </label>
                <input
                    id="image"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
                />
                <p className="text-xs text-[var(--muted)] mt-1">
                    paste a URL to your profile photo (e.g. from GitHub or Gravatar)
                </p>
            </div>

            {/* Bio */}
            <div>
                <label
                    htmlFor="bio"
                    className="block text-sm font-medium mb-1.5"
                >
                    bio
                </label>
                <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="a few words about yourself..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow resize-none"
                />
                <p className="text-xs text-[var(--muted)] mt-1">
                    {bio.length}/500 — this appears at the end of your articles
                </p>
            </div>

            {/* Message */}
            {message && (
                <p
                    className={`text-sm ${message.type === "success"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                >
                    {message.text}
                </p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-500 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {isPending ? "saving..." : "save profile"}
            </button>
        </form>
    );
}
