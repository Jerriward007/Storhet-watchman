import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBrand } from "@/lib/brandContext";
import { priorityColor } from "@/lib/format";

export default function Alerts() {
  const { activeBrand } = useBrand();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const f = activeBrand === "All" ? {} : { brand_name: activeBrand };
    base44.entities.Alert.filter(f, "-created_date", 100).then((a) => { setAlerts(a); setLoading(false); });
  };
  useEffect(load, [activeBrand]);

  const markRead = async (id) => {
    await base44.entities.Alert.update(id, { read: true });
    load();
  };

  const markAll = async () => {
    await base44.entities.Alert.updateMany({ read: false }, { $set: { read: true } });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Real-Time Alerts</h1>
          <p className="text-sm text-muted-foreground">{alerts.filter(a => !a.read).length} unread alerts</p>
        </div>
        <button onClick={markAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
          <Check className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center py-10 text-muted-foreground">Loading...</p>}
        {!loading && alerts.length === 0 && <p className="text-center py-10 text-muted-foreground">No alerts</p>}
        {alerts.map(a => (
          <div key={a.id} className={`rounded-2xl border p-5 flex items-start gap-4 ${a.read ? "border-border bg-card" : "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.severity === "Critical" ? "bg-red-100 dark:bg-red-950 text-red-600" : "bg-amber-100 dark:bg-amber-950 text-amber-600"}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm">{a.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityColor(a.severity)}`}>{a.severity}</span>
                <span className="text-xs text-muted-foreground">{a.brand_name}</span>
                {!a.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{a.message}</p>
            </div>
            {!a.read && <button onClick={() => markRead(a.id)} className="text-xs text-indigo-600 hover:underline shrink-0">Mark read</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
