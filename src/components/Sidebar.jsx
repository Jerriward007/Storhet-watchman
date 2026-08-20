import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Sparkles, Reply, Bell, FileText, Settings, Activity, ChevronRight } from "lucide-react";
import { useBrand } from "@/lib/brandContext";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mentions", label: "Mentions", icon: MessageSquare },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/responses", label: "Response Center", icon: Reply },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { brands, activeBrand, setActiveBrand } = useBrand();
  const [brandOpen, setBrandOpen] = useState(false);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-sidebar-foreground leading-tight">Storhet Watchman</p>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Brand Intelligence</p>
          </div>
        </div>

        <div className="px-3 py-3 border-b border-sidebar-border">
          <button onClick={() => setBrandOpen(!brandOpen)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {activeBrand === "All" ? "A" : activeBrand.slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-sidebar-foreground">{activeBrand}</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${brandOpen ? "rotate-90" : ""}`} />
          </button>
          {brandOpen && (
            <div className="mt-1 space-y-0.5">
              <button onClick={() => { setActiveBrand("All"); setBrandOpen(false); onClose?.(); }} className="w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-sidebar-accent text-sidebar-foreground">All Brands</button>
              {brands.map((b) => (
                <button key={b.id} onClick={() => { setActiveBrand(b.name); setBrandOpen(false); onClose?.(); }} className="w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-sidebar-accent text-sidebar-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
              <n.icon className="w-[18px] h-[18px]" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/60">
            <p className="text-[11px] text-muted-foreground">Data refresh</p>
            <p className="text-xs font-medium text-sidebar-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Every 30 min
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
