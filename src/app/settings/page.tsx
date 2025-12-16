export const runtime = "nodejs";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function fetchFamily(cookie: string) {
  const res = await fetch(`${BASE_URL}/api/family/current`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return null;
  return (await res.json()) as { family: { id: string; name: string; currency: string } };
}

export default async function SettingsPage() {
  const cookie = (await cookies()).toString();
  const fam = await fetchFamily(cookie);
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 py-8 flex">
        <Sidebar />
        <div className="flex-1 pl-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <section className="mt-6 grid gap-4">
            <Card title="Basic Info">
              {fam ? (
                <div className="grid gap-3">
                  <div className="grid grid-cols-[120px,1fr] items-center gap-2">
                    <div className="text-xs opacity-70">Family Name</div>
                    <input className="rounded-md border px-3 py-2 text-sm bg-white/80" value={fam.family.name} readOnly />
                  </div>
                  <div className="grid grid-cols-[120px,1fr] items-center gap-2">
                    <div className="text-xs opacity-70">Currency</div>
                    <input className="rounded-md border px-3 py-2 text-sm bg-white/80" value={fam.family.currency} readOnly />
                  </div>
                </div>
              ) : (
                <div className="text-sm opacity-70">Loading...</div>
              )}
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
