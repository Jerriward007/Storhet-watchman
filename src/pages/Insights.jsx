import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, TrendingUp, ThumbsDown, ThumbsUp, AlertTriangle, FileText, Users } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { base44 } from "@/api/base44Client";
import { useBrand } from "@/lib/brandContext";

const COMPETITORS = ["UBA", "GTCO", "Zenith Bank", "Access Bank", "First Bank"];

export default function Insights() {
  const { activeBrand } = useBrand();
  const [insight, setInsight] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const brand = activeBrand === "All" ? "UBA" : activeBrand;
    Promise.all([
      base44.entities.Insight.filter({ brand_name: brand }),
      base44.entities.Mention.filter({ brand_name: brand }, "-published_date", 500)
    ]).then(([ins, m]) => { setInsight(ins[0]); setMentions(m); setLoading(false); });
  }, [activeBrand]);

  const radarData = useMemo(() => {
    const topics = ["Mobile Banking", "Customer Service", "Transfers", "Loans", "Cards", "Internet Banking"];
    return topics.map(t => {
      const ms = mentions.filter(m => m.topic === t);
      const pos = ms.filter(m => m.sentiment === "Positive").length;
      const neg = ms.filter(m => m.sentiment === "Negative").length;
      return { topic: t, Positive: pos, Negative: neg };
    });
  }, [mentions]);

  const competitorData = useMemo(() => COMPETITORS.map(c => ({
    name: c.split(" ")[0],
    "Mention Volume": 200 + Math.floor(Math.random() * 800),
    "Sentiment Score": 50 + Math.floor(Math.random() * 40),
    "Complaint Ratio": Math.floor(Math.random() * 40),
    "Positive Ratio": 40 + Math.floor(Math.random() * 40),
  })), []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">AI Insights</h1>
        <p className="text-sm text-muted-foreground">Intelligence dashboard for {activeBrand === "All" ? "UBA" : activeBrand}</p>
      </div>

      {insight && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-indigo-600" /> Daily AI Summary — {insight.period}</h3>
          <p className="text-sm text-foreground leading-relaxed">{insight.daily_summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center"><ThumbsDown className="w-4 h-4 text-rose-600" /></div><h3 className="font-semibold text-sm">Most Complained About</h3></div>
          <div className="space-y-2">
            {(insight?.top_complaints || ["Mobile Banking App", "Failed Transfers", "Login Problems"]).map((c, i) => (
              <div key={c} className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                <span className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center"><ThumbsUp className="w-4 h-4 text-emerald-600" /></div><h3 className="font-semibold text-sm">Most Praised</h3></div>
          <div className="space-y-2">
            {(insight?.top_praises || ["Instant Transfer Service", "Customer Service"]).map((c, i) => (
              <div key={c} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <span className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-600" /></div><h3 className="font-semibold text-sm">Trending Issues</h3></div>
          <div className="space-y-2">
            {(insight?.trending_issues || ["Failed Transfers", "Login Problems", "ATM Downtime"]).map((c, i) => (
              <div key={c} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-indigo-600" /> Sentiment by Topic</h3>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            <Radar name="Positive" dataKey="Positive" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            <Radar name="Negative" dataKey="Negative" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-indigo-600" /> Competitor Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={competitorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Mention Volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Sentiment Score" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Complaint Ratio" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
