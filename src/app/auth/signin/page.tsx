import { signIn } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";

export const metadata = {
  title: "Sign In | DevBytes",
  description: "Sign in to DevBytes to start writing technical content.",
};

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-mono font-bold text-lg">
                {"</>"}
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight">DevBytes</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Welcome back
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Sign in with your GitHub account to start writing.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
          >
            <Github className="w-6 h-6" />
            Continue with GitHub
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          Only invited authors can sign in. Contact the admin if you need
          access.
        </p>
      </div>
    </div>
  );
}

