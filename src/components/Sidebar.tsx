"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const item = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${pathname === href ? "bg-green-50" : ""}`}
    >
      <span className="inline-block w-4 h-4">{icon}</span>
      <span>{label}</span>
    </Link>
  );
  const Icon = {
    dashboard: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current opacity-80">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
    tx: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current opacity-80">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="7" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    members: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current opacity-80">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M3 20c0-3 3-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M11 20c0-3 3-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current opacity-80">
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
        <path d="M4 12a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  };
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-white/70 dark:bg-black/40 backdrop-blur-sm">
      <div className="p-3 grid gap-1">
        {item("/dashboard", "Dashboard", Icon.dashboard)}
        {item("/transactions", "Transactions", Icon.tx)}
        {item("/members", "Members", Icon.members)}
        {item("/settings", "Settings", Icon.settings)}
      </div>
    </aside>
  );
}
