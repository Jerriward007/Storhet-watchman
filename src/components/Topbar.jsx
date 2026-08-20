import React, { useState, useEffect } from "react";
import { Menu, Sun, Moon, Bell, Search } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useBrand } from "@/lib/brandContext";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

export default function Topbar({ onMenu }) {
  const { theme, toggle } = useTheme();
  const { activeBrand } = useBrand();
  const [alerts, setAlerts] = useState([]);
  const [showBell, setShowBell] = useState(false);

  useEffect(() => {
    base44.entities.Alert.filter({ read: false }).then(setAlerts).catch(() => {});
  }, []);

  return (
    <header className="h-16 sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 lg:px-6">
      <button onClick={onMenu} className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-muted">
        <Menu className="w-5 h-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search mentions, authors, topics..."
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/60 border border-transparent focus:border-border focus:bg-background text-sm outline-none transition-colors"
        />
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">Monitoring</span>
        <span className="text-xs font-medium">{activeBrand}</span>
      </div>

      <button onClick={toggle} className="p-2 rounded-lg hover:bg-muted transition-colors">
        {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <div className="relative">
        <button onClick={() => setShowBell(!showBell)} className="p-2 rounded-lg hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5" />
          {alerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-background" />}
        </button>
        {showBell && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowBell(false)} />
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm">Alerts</span>
                <Link to="/alerts" onClick={() => setShowBell(false)} className="text-xs text-indigo-600 hover:underline">View all</Link>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground text-center">No new alerts</p>}
                {alerts.map((a) => (
                  <div key={a.id} className="px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">{a.severity}</span>
                      <span className="text-[11px] text-muted-foreground">{a.type}</span>
                    </div>
                    <p className="text-sm text-foreground leading-snug">{a.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
        A
      </div>
    </header>
  );
}
