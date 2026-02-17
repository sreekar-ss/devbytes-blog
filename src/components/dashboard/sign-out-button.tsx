"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}

