import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, User, Clock, Tag, Gauge, Sparkles, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { sentimentColor, categoryColor, priorityColor, statusColor, formatDate } from "@/lib/format";

export default function MentionDetail() {
  const { id } = useParams();
  const [mention, setMention] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Mention.get(id),
      base44.entities.Response.filter({ mention_id: id })
    ]).then(([m, r]) => { setMention(m); setResponses(r); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
  if (!mention) return <div className="text-center py-20 text-muted-foreground">Mention not found</div>;

  return (
    <div className="space-y-5 max-w-4xl">
      <Link to="/mentions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to mentions
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-muted">{mention.source}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${sentimentColor(mention.sentiment)}`}>{mention.sentiment}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryColor(mention.category)}`}>{mention.category}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityColor(mention.priority)}`}>{mention.priority}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor(mention.status)}`}>{mention.status}</span>
        </div>
        <p className="text-lg text-foreground leading-relaxed mb-4">{mention.content}</p>
        <a href={mention.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
          View original <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: User, label: "Author", value: mention.author },
          { icon: Clock, label: "Published", value: formatDate(mention.published_date) },
          { icon: Tag, label: "Topic", value: mention.topic },
          { icon: Gauge, label: "Confidence", value: `${mention.confidence}%` },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><s.icon className="w-3.5 h-3.5" /><span className="text-xs">{s.label}</span></div>
            <p className="font-semibold text-sm">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-indigo-600" /> AI Analysis</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{mention.ai_analysis}</p>
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Brand: <strong className="text-foreground">{mention.brand_name}</strong></span>
          <span className="text-muted-foreground">Assigned to: <strong className="text-foreground">{mention.assigned_to || "Unassigned"}</strong></span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><MessageSquare className="w-4 h-4 text-indigo-600" /> Response History</h3>
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No responses generated yet. <Link to="/responses" className="text-indigo-600 hover:underline">Go to Response Center</Link></p>
        ) : (
          <div className="space-y-3">
            {responses.map(r => (
              <div key={r.id} className="p-4 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Draft by {r.author}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor(r.status)}`}>{r.status}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{r.final_text || r.edited_text || r.draft_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
