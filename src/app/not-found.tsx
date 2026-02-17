import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <p className="text-7xl font-bold font-mono gradient-text mb-4">404</p>
        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-[var(--muted)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

