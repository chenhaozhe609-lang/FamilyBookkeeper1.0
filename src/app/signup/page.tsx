"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Sign up failed");
      return;
    }
    router.push("/dashboard");
  };
  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center">
      <main className="w-full max-w-sm px-6">
        <section className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-sm shadow-sm p-6">
          <div className="text-center text-xl font-semibold">Sign Up</div>
          <form className="mt-4 grid gap-3" onSubmit={submit}>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm bg-white/80 dark:bg-black/30"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm bg-white/80 dark:bg-black/30"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm bg-white/80 dark:bg-black/30"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <div className="text-xs text-red-600">{error}</div> : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
