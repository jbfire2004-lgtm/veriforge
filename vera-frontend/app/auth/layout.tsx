import type { ReactNode } from "react";

/**
 * Isolated shell so sign-in/out routes are not coupled to workspace layouts.
 * Provides a centered, brand-aware backdrop so auth pages can drop in cards
 * without re-implementing layout chrome.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="vera-motion-fade-up flex min-h-screen items-center justify-center bg-vera-surface/40 px-vera-4 py-vera-10 text-vera-charcoal sm:px-vera-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
