export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function deriveStatus(tasks: { status: string }[]): string {
  if (tasks.length === 0) return "TODO";
  if (tasks.some((tk) => tk.status === "BLOCKED")) return "BLOCKED";
  if (tasks.some((tk) => tk.status === "IN_PROGRESS")) return "IN_PROGRESS";
  if (tasks.every((tk) => tk.status === "DONE")) return "DONE";
  return "TODO";
}

export function statusStyle(status: string): {
  bg: string;
  color: string;
  border: string;
  label: string;
} {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    DONE:        { bg: "#dcfce7", color: "#15803d", border: "#86efac", label: "Done" },
    IN_PROGRESS: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", label: "In Progress" },
    BLOCKED:     { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5", label: "Blocked" },
    TODO:        { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1", label: "Todo" },
  };
  return map[status] ?? map.TODO;
}

export function priStyle(pri: string): { bg: string; color: string; border: string } {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    HIGH:   { bg: "#fff7ed", color: "#c2410c", border: "#fdba74" },
    MEDIUM: { bg: "#fefce8", color: "#a16207", border: "#fde047" },
    LOW:    { bg: "#f0f9ff", color: "#0369a1", border: "#7dd3fc" },
  };
  return map[pri] ?? map.LOW;
}

export function sourceColors(source: string): [string, string] {
  const map: Record<string, [string, string]> = {
    WEB:  ["#dbeafe", "#1e40af"],
    BOT:  ["#ede9fe", "#5b21b6"],
    CRON: ["#f0fdf4", "#15803d"],
  };
  return map[source] ?? map.WEB;
}
