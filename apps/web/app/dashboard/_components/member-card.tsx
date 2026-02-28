"use client";

import Link from "next/link";
import { t } from "./tokens";
import { statusStyle } from "./utils";

export type MemberCardData = {
  id: string;
  name: string;
  track: string;
  status: string;
  currentTask: string | null;
  modulesDone: number;
  modulesTotal: number;
  lastActivity: string | null; // ISO string for serialization across server/client boundary
};

function miniTimeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export function MemberCard({ m }: { m: MemberCardData }) {
  const isA = m.track === "A";
  const isBlocked = m.status === "BLOCKED";
  const accent = isBlocked ? "#fca5a5" : isA ? "#93c5fd" : "#5eead4";
  const dots = Array.from({ length: m.modulesTotal }, (_, i) => i < m.modulesDone);
  const st = statusStyle(m.status);
  const memberBg = isA ? "#dbeafe" : "#ccfbf1";
  const memberFg = isA ? "#1e40af" : "#0f766e";

  return (
    <Link href={`/dashboard/members/${m.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: isBlocked ? "#fff8f8" : t.surface,
          border: `1px solid ${isBlocked ? "#fecaca" : t.border}`,
          borderRadius: t.radius,
          padding: 15,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.10)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        }}
      >
        {/* Track accent stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${accent}, transparent)`,
          }}
        />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: memberBg,
              color: memberFg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: t.display,
              flexShrink: 0,
            }}
          >
            {m.name.trim()[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: t.display, fontSize: 13, fontWeight: 600, color: t.text0 }}>
              {m.name}
            </div>
            <div style={{ fontSize: 10, color: t.text1, marginTop: 1 }}>
              {isA ? "Module" : "Phase"} {m.modulesDone} / {m.modulesTotal}
            </div>
          </div>
        </div>

        {/* Module progress dots */}
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {dots.map((done, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: done ? (isA ? "#3b82f6" : "#14b8a6") : "#e2e8f0",
                border: `1px solid ${done ? (isA ? "#3b82f6" : "#14b8a6") : "#cbd5e1"}`,
              }}
            />
          ))}
        </div>

        {/* Current task */}
        <div
          style={{
            fontSize: 11.5,
            color: t.text1,
            lineHeight: 1.5,
            marginBottom: 12,
            overflow: "hidden",
            display: "-webkit-box" as React.CSSProperties["display"],
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
            minHeight: 34,
          }}
        >
          {m.currentTask ?? "No active task this sprint"}
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              background: st.bg,
              color: st.color,
              border: `1px solid ${st.border}`,
              borderRadius: 4,
              fontSize: 8.5,
              fontFamily: t.mono,
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "3px 8px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {st.label}
          </span>
          <span style={{ fontSize: 10, color: t.text2 }}>{miniTimeAgo(m.lastActivity)}</span>
        </div>
      </div>
    </Link>
  );
}
