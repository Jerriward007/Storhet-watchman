import React, { useState, useEffect } from "react";
import { Check, X, Edit3, Send, Sparkles, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBrand } from "@/lib/brandContext";
import { categoryColor, statusColor } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";

export default function ResponseCenter() {
  const { activeBrand } = useBrand();
  const { toast } = useToast();
  const [responses, setResponses] = useState([]);
  const [mentions, setMentions] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");

  const load = () => {
    setLoading(true);
    const f = activeBrand === "All" ? {} : { brand_name: activeBrand };
    Promise.all([
      base44.entities.Response.filter(f, "-created_date", 200),
      base44.entities.Mention.filter({}, "-published_date", 500)
    ]).then(([rs, ms]) => {
      setResponses(rs);
      const map = {}; ms.forEach(m => map[m.id] = m); setMentions(map);
      setLoading(false);
    });
  };
  useEffect(load, [activeBrand]);

  const filtered = responses.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search) {
      const m = mentions[r.mention_id];
      if (!(`${r.draft_text} ${m?.content || ""} ${m?.author || ""}`.toLowerCase().includes(search.toLowerCase()))) return false;
    }
    return true;
  });

  const update = async (id, data, msg) => {
    await base44.entities.Response.update(id, data);
    toast({ title: msg });
    load();
  };

  const saveEdit = async () => {
    await base44.entities.Response.update(editing, { edited_text: editText, status: "Pending Review" });
    toast({ title: "Response edited and sent for review" });
    setEditing(null); load();
  };

  const counts = {
    Draft: responses.filter(r => r.status === "Draft").length,
    "Pending Review": responses.filter(r => r.status === "Pending Review").length,
    Approved: responses.filter(r => r.status === "Approved").length,
    Sent: responses.filter(r => r.status === "Sent" || r.status === "Auto Sent").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Response Center</h1>
        <p className="text-sm text-muted-foreground">Review and manage AI-generated responses</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="text-xl font-bold mt-0.5">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search responses..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-card text-sm outline-none">
          <option value="">All Statuses</option>
          {["Draft", "Pending Review", "Approved", "Rejected", "Sent", "Auto Sent"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center py-10 text-muted-foreground">Loading...</p>}
        {!loading && filtered.length === 0 && <p className="text-center py-10 text-muted-foreground">No responses found</p>}
        {filtered.map(r => {
          const m = mentions[r.mention_id];
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {m && <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryColor(m.category)}`}>{m.category}</span>}
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor(r.status)}`}>{r.status}</span>
                {m && <span className="text-xs text-muted-foreground">{m.source} · {m.author}</span>}
              </div>

              {m && (
                <div className="rounded-lg bg-muted/50 p-3 mb-3 border-l-2 border-slate-300">
                  <p className="text-sm text-muted-foreground italic">"{m.content}"</p>
                </div>
              )}

              {editing === r.id ? (
                <div className="space-y-3">
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4}
                    className="w-full p-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Save</button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{r.final_text || r.edited_text || r.draft_text}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setEditing(r.id); setEditText(r.final_text || r.edited_text || r.draft_text); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => update(r.id, { status: "Approved", final_text: r.edited_text || r.draft_text }, "Response approved")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"><Check className="w-3.5 h-3.5" /> Approve</button>
                    <button onClick={() => update(r.id, { status: "Rejected" }, "Response rejected")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40"><X className="w-3.5 h-3.5" /> Reject</button>
                    <button onClick={() => update(r.id, { status: "Sent", final_text: r.edited_text || r.draft_text }, "Response sent")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"><Send className="w-3.5 h-3.5" /> Send</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
