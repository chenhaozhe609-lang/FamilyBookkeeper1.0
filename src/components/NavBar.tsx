"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { id: string; name: string; email: string } | null;
type FamilyInfo = { family: { id: string; name: string; currency: string } } | null;

export default function NavBar() {
  const [me, setMe] = useState<Me>(null);
  const [family, setFamily] = useState<FamilyInfo>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    fetch("/api/me", { cache: "no-store" })
      .then(async (res) => {
        if (!mounted) return;
        if (!res.ok) {
          setMe(null);
        } else {
          setMe(await res.json());
        }
      })
      .then(() => fetch("/api/family/current", { cache: "no-store" }))
      .then(async (res) => {
        if (!mounted) return;
        if (!res.ok) return setFamily(null);
        setFamily(await res.json());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const signout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
  };
  return (
    <div className="sticky top-0 z-40 bg-white/70 dark:bg-black/40 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          FamilyLedger
        </Link>
        <div className="text-sm opacity-80">
          {family ? family.family.name : ""}
        </div>
        <div className="relative flex items-center gap-2">
          {loading ? null : me ? (
            <>
              <button
                className="flex items-center gap-2 px-3 py-1 rounded-md text-sm border"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-xs">
                  {me.name?.slice(0, 1).toUpperCase()}
                </span>
                <span>{me.name}</span>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-10 w-40 rounded-md border bg-white shadow-sm">
                  <Link href="/dashboard" className="block px-3 py-2 text-sm">Dashboard</Link>
                  <Link href="/members" className="block px-3 py-2 text-sm">Members</Link>
                  <Link href="/transactions" className="block px-3 py-2 text-sm">Transactions</Link>
                  <button onClick={signout} className="block w-full text-left px-3 py-2 text-sm">
                    Sign out
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/signin" className="px-3 py-1 rounded-md text-sm border">
                Sign in
              </Link>
              <Link href="/signup" className="px-3 py-1 rounded-md text-sm border">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
