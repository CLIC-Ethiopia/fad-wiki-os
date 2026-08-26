import { Link } from "react-router-dom";

export function NotFoundView() {
  return (
    <main className="animate-in flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted-foreground)]">404</p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="max-w-md text-[var(--muted-foreground)]">
          That page is not available in this wiki right now. It may have been moved, renamed, or
          removed.
        </p>
      </div>
      <Link
        className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white shadow-md hover:shadow-lg px-4 py-2 text-sm font-medium transition-all active:scale-95"
        to="/"
      >
        Back to wiki
      </Link>
    </main>
  );
}
