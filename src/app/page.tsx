import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">FamilyLedger</h1>
          <p className="mt-3 text-sm opacity-80">Shared family budgeting, simpler collaboration</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/signup" className="px-4 py-2 rounded-md border text-sm">
              Sign Up
            </Link>
            <Link href="/signin" className="px-4 py-2 rounded-md border text-sm">
              Sign In
            </Link>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-sm shadow-sm p-6">
            <div className="text-sm font-medium">Collaboration</div>
            <div className="mt-2 text-xs opacity-70">Invite family to manage income and expenses together</div>
          </div>
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-sm shadow-sm p-6">
            <div className="text-sm font-medium">Visual analytics</div>
            <div className="mt-2 text-xs opacity-70">Dashboard shows trends and monthly summary</div>
          </div>
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-sm shadow-sm p-6">
            <div className="text-sm font-medium">No paywall</div>
            <div className="mt-2 text-xs opacity-70">All features unlocked for every user</div>
          </div>
        </section>
      </main>
    </div>
  );
}
