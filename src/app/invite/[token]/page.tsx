"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type InviteInfo = { valid: boolean; familyName: string; role: "OWNER" | "MEMBER"; expiresAt: string };

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!token) return;
    fetch(`/api/invite/${token}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => setInfo(d));
  }, [token]);
  const accept = async () => {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Join failed");
      return;
    }
    router.push("/dashboard");
  };
  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center">
      <main className="w-full max-w-md px-6">
        <section className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-sm shadow-sm p-6">
          {info ? (
            <>
              <div className="text-center text-xl font-semibold">Join Family</div>
              <div className="mt-3 text-sm opacity-80">Family {info.familyName}</div>
              <div className="mt-1 text-xs opacity-70">Role {info.role}</div>
              <div className="mt-1 text-xs opacity-70">Valid until {info.expiresAt}</div>
              <button
                className="mt-4 w-full px-3 py-2 text-sm border rounded-md"
                onClick={accept}
                disabled={loading || !info.valid}
              >
                {loading ? "Processing..." : info.valid ? "Accept and join" : "Invite unavailable"}
              </button>
              {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
            </>
          ) : (
            <div className="text-sm opacity-70">Loading invite...</div>
          )}
        </section>
      </main>
    </div>
  );
}
