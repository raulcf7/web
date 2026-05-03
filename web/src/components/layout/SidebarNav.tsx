"use client";

import clsx from "clsx";
import { Activity, BookOpen, Goal, LayoutDashboard, Shield, Users, Waypoints } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { id: "overview", label: "Match Overview", icon: LayoutDashboard, href: "#overview" },
  { id: "territory", label: "Territory", icon: Waypoints, href: "#territory" },
  { id: "chance", label: "Chance Creation", icon: Goal, href: "#chance" },
  { id: "defensive", label: "Defensive Behaviour", icon: Shield, href: "#defensive" },
  { id: "players", label: "Player Impact", icon: Users, href: "#players" },
  { id: "tracking", label: "Tracking Shape", icon: Activity, href: "#tracking" },
  { id: "methodology", label: "Methodology", icon: BookOpen, href: "#methodology" },
];

export function SidebarNav() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    for (const item of navItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:overflow-x-visible lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="hidden px-2 pb-6 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-200/80">FCM Analysis</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Post-match hub</h1>
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;

        return (
          <a
            href={item.href}
            key={item.label}
            className={clsx(
              "inline-flex h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
              isActive
                ? "bg-red-500/15 text-white ring-1 ring-red-300/20"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
