export function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const sentimentColor = (s) => ({
  Positive: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  Negative: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  Neutral: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
}[s] || "text-slate-500 bg-slate-100");

export const categoryColor = (c) => ({
  Positive: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  Inquiry: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
  Complaint: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  Irrelevant: "text-slate-500 bg-slate-100 dark:bg-slate-800"
}[c] || "text-slate-500 bg-slate-100");

export const priorityColor = (p) => ({
  Low: "text-slate-500 bg-slate-100 dark:bg-slate-800",
  Medium: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
  High: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400",
  Critical: "text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-400"
}[p] || "text-slate-500 bg-slate-100");

export const statusColor = (s) => ({
  New: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
  Reviewing: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
  Responded: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  Ignored: "text-slate-500 bg-slate-100 dark:bg-slate-800",
  Draft: "text-slate-600 bg-slate-100 dark:bg-slate-800",
  "Pending Review": "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
  Approved: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  Rejected: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  Sent: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
  "Auto Sent": "text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400"
}[s] || "text-slate-500 bg-slate-100");
