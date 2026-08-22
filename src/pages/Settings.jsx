import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Users, Plug, Bell, Shield, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const ROLES = [
  { name: "Super Admin", desc: "Manage all organizations, users, sources, alerts", badge: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" },
  { name: "Brand Manager", desc: "View mentions, insights, approve responses, manage alerts", badge: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" },
  { name: "Analyst", desc: "View mentions, analyze trends, generate reports", badge: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400" },
  { name: "Customer Support Agent", desc: "Review complaints, approve responses, escalate issues", badge: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" },
];

const SOURCES = ["Nairaland", "Twitter", "Facebook", "Instagram", "LinkedIn", "Blog", "Forum", "News", "Review"];

export default function Settings() {
  const { toast } = useToast();
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({ name: "", industry: "", color: "#6366f1" });
  const [threshold, setThreshold] = useState(40);

  useEffect(() => { base44.entities.Brand.list().then(setBrands); }, []);

  const addBrand = async () => {
    if (!newBrand.name) return;
    await base44.entities.Brand.create({ ...newBrand, active: true });
    setBrands(await base44.entities.Brand.list());
    setNewBrand({ name: "", industry: "", color: "#6366f1" });
    toast({ title: "Brand added" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage brands, users, sources, and alerts</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-indigo-600" /> User Roles & Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ROLES.map(r => (
            <div key={r.name} className="p-4 rounded-xl border border-border">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.badge}`}>{r.name}</span>
              <p className="text-sm text-muted-foreground mt-2">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-indigo-600" /> Monitored Brands</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {brands.map(b => (
            <span key={b.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} /> {b.name}
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={newBrand.name} onChange={e => setNewBrand({ ...newBrand, name: e.target.value })} placeholder="Brand name" className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-indigo-500/30" />
          <input value={newBrand.industry} onChange={e => setNewBrand({ ...newBrand, industry: e.target.value })} placeholder="Industry" className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-indigo-500/30" />
          <input type="color" value={newBrand.color} onChange={e => setNewBrand({ ...newBrand, color: e.target.value })} className="h-10 w-12 rounded-lg border border-border bg-background cursor-pointer" />
          <button onClick={addBrand} className="px-4 h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Add</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Plug className="w-4 h-4 text-indigo-600" /> Data Sources</h3>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Data refreshes every 30 minutes via n8n workflows. New sources can be added without redesign.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-indigo-600" /> Alert Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Complaint Surge Threshold: {threshold}%</label>
            <input type="range" min="10" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} className="w-full mt-2 accent-indigo-600" />
            <p className="text-xs text-muted-foreground mt-1">Alert when negative mentions increase by more than {threshold}% within 30 minutes.</p>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <div><p className="text-sm font-medium">Email Alerts</p><p className="text-xs text-muted-foreground">Send critical alerts to email</p></div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
