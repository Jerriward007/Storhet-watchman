import React, { useState, useEffect, useMemo } from "react";
import { FileText, Download, FileSpreadsheet, FileBarChart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBrand } from "@/lib/brandContext";

export default function Reports() {
  const { activeBrand } = useBrand();
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    const f = activeBrand === "All" ? {} : { brand_name: activeBrand };
    base44.entities.Mention.filter(f, "-published_date", 500).then((m) => { setMentions(m); setLoading(false); });
  }, [activeBrand]);

  const summary = useMemo(() => {
    const pos = mentions.filter(m => m.sentiment === "Positive").length;
    const neg = mentions.filter(m => m.sentiment === "Negative").length;
    const neu = mentions.filter(m => m.sentiment === "Neutral").length;
    const complaints = mentions.filter(m => m.category === "Complaint").length;
    return { total: mentions.length, pos, neg, neu, complaints, score: Math.round(pos / (pos + neg || 1) * 100) };
  }, [mentions]);

  const exportCSV = () => {
    const rows = [["Date", "Source", "Author", "Brand", "Sentiment", "Category", "Topic", "Priority", "Status", "Content"]];
    mentions.forEach(m => rows.push([m.published_date, m.source, m.author, m.brand_name, m.sentiment, m.category, m.topic, m.priority, m.status, `"${m.content.replace(/"/g, '""')}"`]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `brandpulse-${activeBrand}-${period}.csv`; a.click();
  };

  const reports = [
    { icon: FileBarChart, title: "Daily Report", desc: "Mention volume, sentiment, complaints for today", iconBg: "bg-indigo-100 dark:bg-indigo-950", iconColor: "text-indigo-600 dark:text-indigo-400" },
    { icon: FileText, title: "Weekly Report", desc: "7-day trends, top topics, AI summary", iconBg: "bg-emerald-100 dark:bg-emerald-950", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { icon: FileSpreadsheet, title: "Monthly Report", desc: "30-day overview, competitor comparison", iconBg: "bg-violet-100 dark:bg-violet-950", iconColor: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and download reports for {activeBrand}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(r => (
          <div key={r.title} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${r.iconBg} flex items-center justify-center mb-3`}>
              <r.icon className={`w-5 h-5 ${r.iconColor}`} />
            </div>
            <h3 className="font-semibold text-sm mb-1">{r.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"><Download className="w-3.5 h-3.5" /> PDF</button>
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"><Download className="w-3.5 h-3.5" /> CSV</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Report Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Mentions", value: summary.total },
            { label: "Positive", value: summary.pos },
            { label: "Negative", value: summary.neg },
            { label: "Complaints", value: summary.complaints },
            { label: "Neutral", value: summary.neu },
            { label: "Sentiment Score", value: `${summary.score}%` },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-muted/40">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
