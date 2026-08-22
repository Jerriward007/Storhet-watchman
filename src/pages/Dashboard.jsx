import React, { useState, useEffect, useMemo } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Meh, Clock, Send, Gauge, TrendingUp, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import KpiCard from "@/components/KpiCard";
import { base44 } from "@/api/base44Client";
import { useBrand } from "@/lib/brandContext";
import { categoryColor, priorityColor, timeAgo } from "@/lib/format";
import { Link } from "react-router-dom";

const SOURCE_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444", "#64748b"];

export default function Dashboard() {
  const { activeBrand } = useBrand();
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    setLoading(true);
    const filter = activeBrand === "All" ? {} : { brand_name: activeBrand };
    base44.entities.Mention.filter(filter, "-published_date", 500).then((m) => {
      setMentions(m);
      setLoading(false);
    });
  }, [activeBrand]);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todays = mentions.filter(m => new Date(m.published_date) >= today);
    const positive = mentions.filter(m => m.sentiment === "Positive").length;
    const negative = mentions.filter(m => m.sentiment === "Negative").length;
    const neutral = mentions.filter(m => m.sentiment === "Neutral").length;
    const score = mentions.length ? Math.round((positive / (positive + negative || 1)) * 100) : 0;
    return {
      today: todays.length,
      positive, negative, neutral,
      complaints: mentions.filter(m => m.category === "Complaint").length,
      score
    };
  }, [mentions]);

  const trendData = useMemo(() => {
    const days = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const buckets = {};
    const now = new Date();
    mentions.forEach(m => {
      const d = new Date(m.published_date);
      const diffHrs = (now - d) / 3600000;
      if (range === "24h") {
        const h = d.getHours();
        const key = `${h}:00`;
        buckets[key] = buckets[key] || { time: key, Positive: 0, Negative: 0, Neutral: 0 };
        buckets[key][m.sentiment]++;
      } else if (diffHrs <= days * 24) {
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        buckets[key] = buckets[key] || { time: key, Positive: 0, Negative: 0, Neutral: 0 };
        buckets[key][m.sentiment]++;
      }
    });
    return Object.values(buckets).slice(range === "24h" ? -24 : -90);
  }, [mentions, range]);

  const sourceData = useMemo(() => {
    const map = {};
    mentions.forEach(m => { map[m.source] = (map[m.source] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [mentions]);

  const topicData = useMemo(() => {
    const map = {};
    mentions.forEach(m => { if (m.category !== "Irrelevant") map[m.topic] = (map[m.topic] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [mentions]);

  const recent = mentions.slice(0, 6);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time brand intelligence for {activeBrand}</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {["24h", "7d", "30d", "90d"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              {r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <KpiCard label="Mentions Today" value={stats.today.toLocaleString()} icon={MessageSquare} accent="indigo" trend={12} />
        <KpiCard label="Positive" value={stats.positive.toLocaleString()} icon={ThumbsUp} accent="emerald" trend={8} />
        <KpiCard label="Negative" value={stats.negative.toLocaleString()} icon={ThumbsDown} accent="rose" trend={-5} />
        <KpiCard label="Neutral" value={stats.neutral.toLocaleString()} icon={Meh} accent="slate" />
        <KpiCard label="Complaints Open" value={stats.complaints.toLocaleString()} icon={Clock} accent="amber" />
        <KpiCard label="Responses Sent" value="1,240" icon={Send} accent="blue" trend={15} />
        <KpiCard label="Sentiment Score" value={`${stats.score}%`} icon={Gauge} accent="indigo" trend={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-600" /> Sentiment Trend</h3>
              <p className="text-xs text-muted-foreground">Mentions over {range}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} /><stop offset="100%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                <linearGradient id="gNeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#64748b" stopOpacity={0.3} /><stop offset="100%" stopColor="#64748b" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }} />
              <Area type="monotone" dataKey="Positive" stroke="#10b981" strokeWidth={2} fill="url(#gPos)" />
              <Area type="monotone" dataKey="Negative" stroke="#f43f5e" strokeWidth={2} fill="url(#gNeg)" />
              <Area type="monotone" dataKey="Neutral" stroke="#64748b" strokeWidth={2} fill="url(#gNeu)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><PieIcon className="w-4 h-4 text-indigo-600" /> Source Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-indigo-600" /> Topic Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topicData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Mentions</h3>
            <Link to="/mentions" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.map(m => (
              <Link to={`/mentions/${m.id}`} key={m.id} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/60">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{m.source}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${categoryColor(m.category)}`}>{m.category}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(m.published_date)}</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2 leading-snug">{m.content}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
