import { PostEditor } from "@/components/dashboard/post-editor";
import { createPost } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "New Post",
};

export default function NewPostPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <PostEditor
        onSubmit={async (data) => {
          "use server";
          await createPost(data);
        }}
      />
    </div>
  );
}

