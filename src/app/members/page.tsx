"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Member = { userId: string; name: string; email: string; role: "OWNER" | "MEMBER"; joinedAt: string };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [role, setRole] = useState<"OWNER" | "MEMBER" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([
      fetch("/api/family/current", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/family/members", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([curr, list]) => {
        if (!curr || !list) {
          setError("Failed to load member info");
          return;
        }
        setRole(curr.role);
        setMembers(list.members);
      })
      .finally(() => setLoading(false));
  }, []);
  const removeMember = async (userId: string) => {
    const res = await fetch("/api/family/members/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return;
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Members</h1>
        {loading ? (
          <div className="mt-6 text-sm opacity-70">Loading...</div>
        ) : error ? (
          <div className="mt-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="mt-6 rounded-xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 p-4">
            <div className="flex justify-end">
              <Link href="/invite" className="px-3 py-2 rounded-md text-sm bg-green-100 border">
                Invite Members
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {members.map((m) => (
                <div key={m.userId} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs opacity-70">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">{m.role}</span>
                    {role === "OWNER" && m.role === "MEMBER" ? (
                      <button className="px-2 py-1 text-xs border rounded-md" onClick={() => removeMember(m.userId)}>
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
