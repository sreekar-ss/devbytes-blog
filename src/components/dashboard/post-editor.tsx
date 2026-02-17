"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Save, Eye, EyeOff, Star, Trash2 } from "lucide-react";

// Dynamic import for the markdown editor (client-only)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-xl bg-[var(--surface)] animate-pulse" />
  ),
});

type PostEditorProps = {
  initialData?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    coverImage: string;
    tagNames: string[];
    published: boolean;
    featured: boolean;
  };
  onSubmit: (data: {
    title: string;
    excerpt: string;
    content: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    coverImage?: string;
    tagNames: string[];
    published: boolean;
    featured: boolean;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function PostEditor({ initialData, onSubmit, onDelete }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >(initialData?.difficulty || "intermediate");
  const [coverImage, setCoverImage] = useState(
    initialData?.coverImage || ""
  );
  const [tagInput, setTagInput] = useState(
    initialData?.tagNames?.join(", ") || ""
  );
  const [published, setPublished] = useState(
    initialData?.published || false
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const tagNames = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        difficulty,
        coverImage: coverImage.trim() || undefined,
        tagNames,
        published,
        featured,
      });
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-[var(--muted-foreground)] tracking-tight"
        />
      </div>

      {/* Excerpt */}
      <div>
        <textarea
          placeholder="Write a brief excerpt..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          required
          rows={2}
          className="w-full text-lg bg-transparent border-none outline-none placeholder:text-[var(--muted-foreground)] resize-none text-[var(--muted)]"
        />
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        {/* Difficulty */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value as "beginner" | "intermediate" | "advanced"
              )
            }
            className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Tags */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            placeholder="React, TypeScript, DevOps..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>

        {/* Cover Image */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
            Cover Image URL (optional)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      {/* Content Editor */}
      <div data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={500}
          preview="live"
          className="!rounded-xl overflow-hidden"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex items-center gap-4">
          {/* Published Toggle */}
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              published
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"
            }`}
          >
            {published ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {published ? "Published" : "Draft"}
          </button>

          {/* Featured Toggle */}
          <button
            type="button"
            onClick={() => setFeatured(!featured)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              featured
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"
            }`}
          >
            <Star className="w-4 h-4" />
            {featured ? "Featured" : "Not Featured"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Delete */}
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving
              ? "Saving..."
              : initialData
              ? "Update Post"
              : "Create Post"}
          </button>
        </div>
      </div>
    </form>
  );
}

