import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBrand } from "@/lib/brandContext";
import { sentimentColor, categoryColor, priorityColor, statusColor, timeAgo } from "@/lib/format";
import { Link } from "react-router-dom";

const SOURCES = ["Nairaland", "Twitter", "Facebook", "Instagram", "LinkedIn", "Blog", "Forum", "News", "Review"];
const SENTIMENTS = ["Positive", "Negative", "Neutral"];
const CATEGORIES = ["Positive", "Inquiry", "Complaint", "Irrelevant"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["New", "Reviewing", "Responded", "Ignored"];

export default function Mentions() {
  const { activeBrand } = useBrand();
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ source: "", sentiment: "", category: "", priority: "", status: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    setLoading(true);
    const f = activeBrand === "All" ? {} : { brand_name: activeBrand };
    base44.entities.Mention.filter(f, "-published_date", 500).then((m) => { setMentions(m); setLoading(false); });
  }, [activeBrand]);

  const filtered = useMemo(() => {
    return mentions.filter(m => {
      if (search && !(`${m.author} ${m.content} ${m.brand_name} ${m.topic}`.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filters.source && m.source !== filters.source) return false;
      if (filters.sentiment && m.sentiment !== filters.sentiment) return false;
      if (filters.category && m.category !== filters.category) return false;
      if (filters.priority && m.priority !== filters.priority) return false;
      if (filters.status && m.status !== filters.status) return false;
      return true;
    });
  }, [mentions, search, filters]);

  const pages = Math.ceil(filtered.length / perPage);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: f[k] === v ? "" : v })); setPage(1); };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Mentions</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} mentions for {activeBrand}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search author, text, brand, topic..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 h-10 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          {[
            { label: "Source", key: "source", opts: SOURCES },
            { label: "Sentiment", key: "sentiment", opts: SENTIMENTS },
            { label: "Category", key: "category", opts: CATEGORIES },
            { label: "Priority", key: "priority", opts: PRIORITIES },
            { label: "Status", key: "status", opts: STATUSES },
          ].map(g => (
            <div key={g.key}>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">{g.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.opts.map(o => (
                  <button key={o} onClick={() => setF(g.key, o)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${filters[g.key] === o ? "bg-indigo-600 text-white" : "bg-muted text-foreground hover:bg-muted/70"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Author</th>
                <th className="text-left px-4 py-3 font-medium">Comment</th>
                <th className="text-left px-4 py-3 font-medium">Sentiment</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Topic</th>
                <th className="text-left px-4 py-3 font-medium">Priority</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Loading...</td></tr>}
              {!loading && pageItems.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No mentions found</td></tr>}
              {pageItems.map(m => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{timeAgo(m.published_date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{m.source}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{m.author}</td>
                  <td className="px-4 py-3 max-w-xs"><Link to={`/mentions/${m.id}`} className="hover:text-indigo-600 line-clamp-1 block">{m.content}</Link></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${sentimentColor(m.sentiment)}`}>{m.sentiment}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryColor(m.category)}`}>{m.category}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{m.topic}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityColor(m.priority)}`}>{m.priority}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor(m.status)}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
