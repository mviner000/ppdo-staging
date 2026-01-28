// app/dashboard/settings/updates/layout.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function BadgeBubble({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-[#15803D] text-white text-xs font-semibold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Nav() {
  const pathname = usePathname();
  const reports = useQuery(api.bugReports.getAll);
  const suggestions = useQuery(api.suggestions.getAll);

  const bugReports = reports?.filter((r) => r.status === "pending").length || 0;
  const suggestionsPending = suggestions?.filter((s) => s.status === "pending").length || 0;

  const isActive = (path: string) => {
    if (path === "/dashboard/settings/updates") {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const linkClasses = (path: string) => {
    const base = "relative px-3 py-2 rounded-md transition-colors font-medium text-sm";
    return isActive(path)
      ? `${base} bg-[#15803D]/10 text-[#15803D]`
      : `${base} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800`;
  };

  return (
    <nav className="flex gap-2 border-b pb-4 overflow-x-auto">
      <Link href="/dashboard/settings/updates" className={linkClasses("/dashboard/settings/updates")}>
        Overview
      </Link>
      <Link
        href="/dashboard/settings/updates/changelogs"
        className={linkClasses("/dashboard/settings/updates/changelogs")}
      >
        Changelogs
      </Link>

      <Link
        href="/dashboard/settings/updates/bugs-report"
        className={`${linkClasses("/dashboard/settings/updates/bugs-report")} relative`}
      >
        Bugs
        <BadgeBubble count={bugReports} />
      </Link>

      <Link
        href="/dashboard/settings/updates/suggestions"
        className={`${linkClasses("/dashboard/settings/updates/suggestions")} relative`}
      >
        Suggestions
        <BadgeBubble count={suggestionsPending} />
      </Link>
    </nav>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 space-y-6">
      <Nav />
      {children}
    </div>
  );
}