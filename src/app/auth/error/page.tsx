import Link from "next/link";

export const metadata = {
  title: "Auth Error | DevBytes",
};

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-500 text-3xl">!</span>
        </div>
        <h1 className="text-2xl font-bold mb-3">Authentication Error</h1>
        <p className="text-[var(--muted)] mb-8">
          There was a problem signing you in. This could mean your GitHub
          account is not in the allowed authors list.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[var(--card-border)] rounded-xl hover:bg-[var(--card-hover)] transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

