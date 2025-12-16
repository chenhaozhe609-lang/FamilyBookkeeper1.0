"use client";
import { useEffect, useState } from "react";

type FamilyCurrent = { family: { id: string; name: string; currency: string; ownerId: string }; role: "OWNER" | "MEMBER" };

export default function InvitePage() {
  const [curr, setCurr] = useState<FamilyCurrent | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch("/api/family/current", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        return await r.json();
      })
      .then((d) => setCurr(d));
  }, []);
  const createInvite = async () => {
    setError(null);
    setToken(null);
    setExpiresAt(null);
    setLoading(true);
    const res = await fetch("/api/invite/create", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("Create failed");
      return;
    }
    const data = await res.json();
    setToken(data.token);
    setExpiresAt(data.expiresAt);
  };
  const link = token ? `/invite/${token}` : null;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Invite</h1>
        {curr && curr.role === "OWNER" ? (
          <div className="mt-6 rounded-xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 p-4">
            <button
              className="px-3 py-2 text-sm border rounded-md"
              onClick={createInvite}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create invite link"}
            </button>
            {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
            {link ? (
              <div className="mt-4">
                <div className="text-sm">Invite link</div>
                <div className="mt-1 text-xs">
                  <a href={link} className="underline">{link}</a>
                </div>
                <div className="mt-1 text-xs opacity-70">Valid until {expiresAt}</div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 text-sm opacity-70">Only OWNER can create invites</div>
        )}
      </main>
    </div>
  );
}
