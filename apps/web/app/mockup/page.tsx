"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type View = "dashboard" | "sprint" | "member" | "learning" | "admin" | "project";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SPRINT = {
  name: "Sprint 7 — Claude Mastery × DeepClients AI",
  week: "Week 2 of 3 · Feb 17 – Mar 3, 2026",
  done: 17, active: 8, blocked: 2, todo: 6, total: 33, pct: 68,
};

const MEMBERS = [
  { id: "erika",    name: "Erika",    init: "E", track: "A", done: 4, total: 8, status: "IN_PROGRESS", ago: "2h ago",  bg: "#dbeafe", fg: "#1e40af", task: "Reviewing AI prompt chaining patterns — Cap.so submission due Friday" },
  { id: "rodrigo",  name: "Rodrigo",  init: "R", track: "A", done: 6, total: 8, status: "DONE",        ago: "30m ago", bg: "#e0e7ff", fg: "#3730a3", task: "Multi-agent pipeline for client research automation" },
  { id: "alba",     name: "Alba",     init: "A", track: "A", done: 3, total: 8, status: "BLOCKED",     ago: "1d ago",  bg: "#ffe4e6", fg: "#9f1239", task: "Awaiting API key access for Anthropic sandbox environment" },
  { id: "jesus",    name: "Jesus",    init: "J", track: "A", done: 5, total: 8, status: "IN_PROGRESS", ago: "5h ago",  bg: "#ede9fe", fg: "#5b21b6", task: "Testing tool use + function calling in production scenario" },
  { id: "wladimir", name: "Wladimir", init: "W", track: "B", done: 3, total: 5, status: "IN_PROGRESS", ago: "1h ago",  bg: "#ccfbf1", fg: "#0f766e", task: "Mapping client ICP profiles using AI-assisted research framework" },
  { id: "nick",     name: "Nick",     init: "N", track: "B", done: 4, total: 5, status: "TODO",        ago: "3h ago",  bg: "#cffafe", fg: "#0e7490", task: "Building outreach sequence templates with personalisation variables" },
] as const;

type Member = typeof MEMBERS[number];

const TASKS = [
  { id: 1,  title: "Cap.so submission for Module 07",            assignee: "rodrigo",  pri: "MEDIUM", tag: "Mod 07",  status: "TODO" },
  { id: 2,  title: "Outreach sequence — variant B templates",    assignee: "nick",     pri: "MEDIUM", tag: "Phase 5", status: "TODO" },
  { id: 3,  title: "RAG prototype — vector search setup",        assignee: "jesus",    pri: "LOW",    tag: "Mod 07",  status: "TODO" },
  { id: 4,  title: "Review Module 06 challenge brief",           assignee: "erika",    pri: "LOW",    tag: "Mod 06",  status: "TODO" },
  { id: 5,  title: "Advanced chaining — Cap.so recording",       assignee: "erika",    pri: "HIGH",   tag: "Mod 04",  status: "IN_PROGRESS" },
  { id: 6,  title: "ICP profile framework v2",                   assignee: "wladimir", pri: "HIGH",   tag: "Phase 3", status: "IN_PROGRESS" },
  { id: 7,  title: "Tool use / function calling — prod test",    assignee: "jesus",    pri: "MEDIUM", tag: "Mod 05",  status: "IN_PROGRESS" },
  { id: 8,  title: "AI-personalised outreach sequence draft",    assignee: "nick",     pri: "MEDIUM", tag: "Phase 4", status: "IN_PROGRESS" },
  { id: 9,  title: "Claude Fundamentals — all 4 submissions",    assignee: "erika",    pri: "MEDIUM", tag: "Mod 01",  status: "DONE" },
  { id: 10, title: "Prompt Engineering show & tell",             assignee: "rodrigo",  pri: "HIGH",   tag: "Mod 02",  status: "DONE" },
  { id: 11, title: "Multi-agent pipeline v1 demo",               assignee: "rodrigo",  pri: "HIGH",   tag: "Mod 06",  status: "DONE" },
  { id: 12, title: "Client research ICP template",               assignee: "wladimir", pri: "MEDIUM", tag: "Phase 2", status: "DONE" },
  { id: 13, title: "Chains & Pipelines challenge",               assignee: "jesus",    pri: "MEDIUM", tag: "Mod 03",  status: "DONE" },
  { id: 14, title: "Anthropic sandbox API key — IT provisioning",assignee: "alba",     pri: "HIGH",   tag: "Mod 04",  status: "BLOCKED" },
  { id: 15, title: "Cap.so recording — microphone hardware",     assignee: "rodrigo",  pri: "MEDIUM", tag: "Mod 05",  status: "BLOCKED" },
];

const MODULES_A = [
  { n: "01", title: "Claude Fundamentals",  desc: "API overview, model families, token limits and basic prompt structure.",  by: ["E","R","A","J"], total: 4, state: "done" },
  { n: "02", title: "Prompt Engineering",   desc: "Few-shot examples, system prompts, chain-of-thought and output formats.", by: ["E","R","A","J"], total: 4, state: "done" },
  { n: "03", title: "Chains & Pipelines",   desc: "Multi-step prompt sequences, conditional routing, structured outputs.",   by: ["E","R","A"],     total: 4, state: "done" },
  { n: "04", title: "Advanced Chaining",    desc: "Complex patterns, sub-agents, error handling and parallel pipelines.",    by: ["E","R"],         total: 4, state: "active" },
  { n: "05", title: "Tool Use",             desc: "Function calling, API integrations, structured tool schemas and results.", by: ["J"],             total: 4, state: "active" },
  { n: "06", title: "Multi-Agent Systems",  desc: "Orchestrator-worker patterns, routing logic, agent communication.",       by: [],                total: 4, state: "locked" },
  { n: "07", title: "RAG & Memory",         desc: "Embeddings, vector retrieval, context windows and long-term memory.",    by: [],                total: 4, state: "locked" },
  { n: "08", title: "Production AI",        desc: "Evaluation, safety guardrails, observability and deployment patterns.",  by: [],                total: 4, state: "locked" },
];

const MODULES_B = [
  { n: "01", title: "AI Foundations for Sales",  desc: "Understanding AI capabilities and how they transform client acquisition.", by: ["W","N"], total: 2, state: "done" },
  { n: "02", title: "ICP Research Automation",   desc: "Using AI to build and validate ideal client profiles at scale.",          by: ["W","N"], total: 2, state: "done" },
  { n: "03", title: "Outreach Personalisation",  desc: "AI-generated personalised outreach using prospect research signals.",     by: ["W"],     total: 2, state: "active" },
  { n: "04", title: "Sequence Building",         desc: "Multi-touch sequences with AI-written variations and A/B testing.",       by: ["N"],     total: 2, state: "active" },
  { n: "05", title: "Closing & Follow-up",       desc: "AI-assisted objection handling, follow-up cadences and deal tracking.",   by: [],        total: 2, state: "locked" },
];

const ACTIVITY = [
  { member: "Rodrigo",  action: "completed",  item: "Multi-agent pipeline demo",           source: "BOT",  when: "30m ago" },
  { member: "Erika",    action: "updated to", item: "IN PROGRESS — Advanced chaining",     source: "WEB",  when: "2h ago" },
  { member: "Wladimir", action: "submitted",  item: "Cap.so — ICP framework walkthrough",  source: "BOT",  when: "3h ago" },
  { member: "Nick",     action: "started",    item: "AI outreach sequence draft",          source: "WEB",  when: "3h ago" },
  { member: "System",   action: "sent",       item: "Weekly sprint digest email",          source: "CRON", when: "5h ago" },
];

const WALL = [
  { title: "Advanced Chaining Patterns in Production", mem: "R", name: "Rodrigo", mod: "MOD 04", dur: "4:23", ago: "30m ago", tbg: "#f0f9ff", pbg: "#dbeafe", pbr: "#93c5fd", pc: "#1e40af", mb: "#1e40af" },
  { title: "Prompt Engineering Show & Tell",           mem: "E", name: "Erika",   mod: "MOD 02", dur: "6:11", ago: "5d ago",  tbg: "#f0fdf4", pbg: "#dcfce7", pbr: "#86efac", pc: "#15803d", mb: "#15803d" },
  { title: "Multi-Agent Orchestration Deep Dive",      mem: "R", name: "Rodrigo", mod: "MOD 06", dur: "7:48", ago: "1d ago",  tbg: "#faf5ff", pbg: "#ede9fe", pbr: "#c4b5fd", pc: "#5b21b6", mb: "#5b21b6" },
  { title: "Claude Fundamentals — My Takeaways",       mem: "J", name: "Jesus",   mod: "MOD 01", dur: "3:55", ago: "1w ago",  tbg: "#fff7ed", pbg: "#ffedd5", pbr: "#fed7aa", pc: "#c2410c", mb: "#c2410c" },
  { title: "Tool Use — Live Demo with APIs",           mem: "J", name: "Jesus",   mod: "MOD 05", dur: "9:02", ago: "6h ago",  tbg: "#ecfdf5", pbg: "#d1fae5", pbr: "#6ee7b7", pc: "#059669", mb: "#059669" },
  { title: "ICP Research Automation Walkthrough",      mem: "W", name: "Wladimir",mod: "PH 02",  dur: "5:17", ago: "3d ago",  tbg: "#f0fdfa", pbg: "#ccfbf1", pbr: "#5eead4", pc: "#0f766e", mb: "#0f766e" },
];

const SPRINT_HISTORY = [
  { n: 7, pct: 68, active: true },
  { n: 6, pct: 100, active: false },
  { n: 5, pct: 100, active: false },
  { n: 4, pct: 82,  active: false },
  { n: 3, pct: 91,  active: false },
];

// ─── Project Summary Data ────────────────────────────────────────────────────
const PROJECT = {
  name: "Project ODIN",
  tagline: "Build an AI-powered internal operations platform that transforms how DeepSea Developments manages learning, client acquisition, and team alignment.",
  botLastSynth: "3h ago",
  botMessage: "Based on team check-ins this sprint, I've drafted 3 objectives below. Rodrigo has concerns about Objective 3 — the scope feels too broad without clearer milestones. I've flagged it for discussion. 4 members still haven't voted on Objective 2 (Track B focused). I'll send a Discord nudge at 5 PM if no response.",
  overallAlignment: 78,
};

type VoteMap = { erika: number | null; rodrigo: number | null; alba: number | null; jesus: number | null; wladimir: number | null; nick: number | null };

const OBJECTIVES: { id: string; title: string; desc: string; source: string; status: string; votes: VoteMap }[] = [
  {
    id: "obj1",
    title: "Master Claude AI for production use",
    desc: "Every Track A member completes all 8 modules and ships one production-ready Claude workflow — demonstrated via Cap.so — by end of Sprint 10.",
    source: "BOT",
    status: "ALIGNED",
    votes: { erika: 4, rodrigo: 4, alba: 3, jesus: 4, wladimir: null, nick: null },
  },
  {
    id: "obj2",
    title: "Land 3 new clients via AI-assisted outreach",
    desc: "Track B builds and deploys a full AI-powered outreach system — ICP research, personalised sequences, follow-up — targeting 3 signed clients by end of Sprint 10.",
    source: "nick",
    status: "REVIEWING",
    votes: { erika: null, rodrigo: null, alba: null, jesus: null, wladimir: 3, nick: 4 },
  },
  {
    id: "obj3",
    title: "Deliver ODIN platform v1 to the whole team",
    desc: "Ship a fully functional web dashboard + Discord bot used daily by every team member for task tracking, progress visibility, and AI-assisted sprint summaries.",
    source: "BOT",
    status: "CONTESTED",
    votes: { erika: 4, rodrigo: 2, alba: 1, jesus: 3, wladimir: 4, nick: 4 },
  },
];

const PROJ_TASKS: { id: string; title: string; track: string; due: string; status: string; votes: VoteMap }[] = [
  { id: "pt1", title: "Complete all 8 Claude Mastery modules",         track: "A",  due: "Mar 3",  status: "ALIGNED",   votes: { erika: 4, rodrigo: 4, alba: 4, jesus: 4, wladimir: null, nick: null } },
  { id: "pt2", title: "Build AI outreach pipeline end-to-end",         track: "B",  due: "Mar 3",  status: "REVIEWING", votes: { erika: null, rodrigo: null, alba: null, jesus: null, wladimir: 4, nick: 3 } },
  { id: "pt3", title: "Ship ODIN web dashboard + bot v1",              track: "AB", due: "Mar 10", status: "ALIGNED",   votes: { erika: 4, rodrigo: 3, alba: null, jesus: 4, wladimir: 4, nick: 4 } },
  { id: "pt4", title: "Record Cap.so show-and-tell for every module",  track: "A",  due: "Mar 17", status: "REVIEWING", votes: { erika: 3, rodrigo: 3, alba: null, jesus: null, wladimir: null, nick: null } },
];

// ─── Design tokens ───────────────────────────────────────────────────────────
const t = {
  bg:      "#f1f4f8",
  surface: "#ffffff",
  border:  "#e2e8f0",
  borderHi:"#cbd5e1",
  trackA:  "#2563eb",
  trackB:  "#0d9488",
  text0:   "#0f172a",
  text1:   "#64748b",
  text2:   "#94a3b8",
  radius:  "10px",
  sans:    "'DM Sans', system-ui, sans-serif",
  display: "'Syne', system-ui, sans-serif",
  mono:    "'Space Mono', monospace",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function memberById(id: string): Member {
  return MEMBERS.find(m => m.id === id) ?? MEMBERS[0];
}

function statusStyle(status: string) {
  const map: Record<string, [string, string, string, string]> = {
    DONE:        ["#dcfce7", "#15803d", "#86efac", "Done"],
    IN_PROGRESS: ["#dbeafe", "#1e40af", "#93c5fd", "In Progress"],
    BLOCKED:     ["#fee2e2", "#b91c1c", "#fca5a5", "Blocked"],
    TODO:        ["#f1f5f9", "#64748b", "#cbd5e1", "Todo"],
  };
  const [bg, color, border, label] = map[status] ?? map.TODO;
  return { bg, color, border, label };
}

function priStyle(pri: string) {
  const map: Record<string, [string, string, string]> = {
    HIGH:   ["#fff7ed", "#c2410c", "#fdba74"],
    MEDIUM: ["#fefce8", "#a16207", "#fde047"],
    LOW:    ["#f0f9ff", "#0369a1", "#7dd3fc"],
  };
  const [bg, color, border] = map[pri] ?? map.LOW;
  return { bg, color, border };
}

function sourceColors(source: string): [string, string] {
  const map: Record<string, [string, string]> = {
    WEB:  ["#dbeafe", "#1e40af"],
    BOT:  ["#ede9fe", "#5b21b6"],
    CRON: ["#f0fdf4", "#15803d"],
  };
  return map[source] ?? map.WEB;
}

// ─── Shared badge components ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const st = statusStyle(status);
  return (
    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 4, fontSize: 8.5, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {st.label}
    </span>
  );
}

function PriBadge({ pri }: { pri: string }) {
  const p = priStyle(pri);
  return (
    <span style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}`, borderRadius: 4, fontSize: 8, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 6px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {pri}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const [bg, color] = sourceColors(source);
  return (
    <span style={{ background: bg, color, borderRadius: 4, fontSize: 8, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 6px", whiteSpace: "nowrap" }}>
      {source}
    </span>
  );
}

function Avatar({ m, size = 32 }: { m: Member; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: m.bg, color: m.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, fontFamily: t.display, flexShrink: 0 }}>
      {m.init}
    </div>
  );
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconGrid   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
const IconBoard  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
const IconLayers = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const IconShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconOdin   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="12" rx="9" ry="5.5"/><circle cx="12" cy="12" r="2.5" fill="#fff" stroke="none"/></svg>;
const IconAlert  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconCheck  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>;
const IconLock   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>;
const IconPlay   = ({ color }: { color: string }) => <svg viewBox="0 0 24 24" width="16" height="16" fill={color}><path d="M8 5v14l11-7z"/></svg>;
const IconTarget = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconStar   = ({ filled }: { filled: boolean }) => <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "#e2e8f0"} stroke={filled ? "#d97706" : "#cbd5e1"} strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;

// ─── Shared layout helpers ────────────────────────────────────────────────────
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radius, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

function PanelHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
      {children}
    </div>
  );
}

function TrackHeader({ track, title, meta }: { track: "A" | "B"; title: string; meta: string }) {
  const isA = track === "A";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: t.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", padding: "3px 9px", borderRadius: 4, background: isA ? "#dbeafe" : "#ccfbf1", color: isA ? "#1e40af" : "#0f766e", border: `1px solid ${isA ? "#93c5fd" : "#5eead4"}` }}>
        TRACK {track}
      </span>
      <span style={{ fontFamily: t.display, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t.text0 }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: t.border }} />
      <span style={{ fontSize: 10, color: t.text2, fontFamily: t.mono }}>{meta}</span>
    </div>
  );
}

function PageHeader({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <div style={{ fontFamily: t.display, fontSize: 24, fontWeight: 700, color: t.text0 }}>{title}</div>
        <div style={{ fontSize: 12, color: t.text1, marginTop: 4 }}>{sub}</div>
      </div>
      {children && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{children}</div>}
    </div>
  );
}

function Btn({ children, primary, onClick }: { children: React.ReactNode; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ background: primary ? t.trackA : t.surface, border: primary ? "none" : `1px solid ${t.border}`, color: primary ? "#fff" : t.text1, padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: primary ? 600 : 500, cursor: "pointer", fontFamily: t.sans }}>
      {children}
    </button>
  );
}

// ─── Member Card (shared between Dashboard and wherever) ──────────────────────
function MemberCard({ m, onClick }: { m: Member; onClick: () => void }) {
  const isA = m.track === "A";
  const isBlocked = m.status === "BLOCKED";
  const accent = isBlocked ? "#fca5a5" : isA ? "#93c5fd" : "#5eead4";
  const dots = Array.from({ length: m.total }, (_, i) => i < m.done);

  return (
    <div
      onClick={onClick}
      style={{ background: isBlocked ? "#fff8f8" : t.surface, border: `1px solid ${isBlocked ? "#fecaca" : t.border}`, borderRadius: t.radius, padding: 15, cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
        <Avatar m={m} size={32} />
        <div>
          <div style={{ fontFamily: t.display, fontSize: 13, fontWeight: 600, color: t.text0 }}>{m.name}</div>
          <div style={{ fontSize: 10, color: t.text1, marginTop: 1 }}>{isA ? "Module" : "Phase"} {m.done} / {m.total}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {dots.map((done, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: done ? (isA ? "#3b82f6" : "#14b8a6") : "#e2e8f0", border: `1px solid ${done ? (isA ? "#3b82f6" : "#14b8a6") : "#cbd5e1"}` }} />
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: t.text1, lineHeight: 1.5, marginBottom: 12, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, minHeight: 34 }}>
        {m.task}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StatusBadge status={m.status} />
        <span style={{ fontSize: 10, color: t.text2 }}>{m.ago}</span>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ view, setView, selectedMember, onMemberClick }: {
  view: View;
  setView: (v: View) => void;
  selectedMember: string;
  onMemberClick: (id: string) => void;
}) {
  function NavItem({ label, v, Icon, badge }: { label: string; v: View; Icon: () => React.ReactElement; badge?: number }) {
    const active = view === v && v !== "member";
    return (
      <div
        onClick={() => setView(v)}
        style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: active ? t.trackA : t.text1, background: active ? "#eff6ff" : "transparent", position: "relative", transition: "color 0.15s, background 0.15s" }}
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.color = t.text0; (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.color = t.text1; (e.currentTarget as HTMLDivElement).style.background = "transparent"; } }}
      >
        {active && <div style={{ position: "absolute", left: 0, top: 4, bottom: 4, width: 2, borderRadius: "0 2px 2px 0", background: t.trackA }} />}
        <span style={{ opacity: active ? 1 : 0.5, display: "flex" }}><Icon /></span>
        {label}
        {badge !== undefined && <span style={{ marginLeft: "auto", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 9, fontFamily: t.mono, fontWeight: 700, padding: "1px 6px" }}>{badge}</span>}
      </div>
    );
  }

  function MemberNavItem({ m }: { m: Member }) {
    const isA = m.track === "A";
    const active = view === "member" && selectedMember === m.id;
    const activeColor = isA ? t.trackA : t.trackB;
    return (
      <div
        onClick={() => onMemberClick(m.id)}
        style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 18px", cursor: "pointer", fontSize: 12, fontWeight: 500, color: active ? activeColor : t.text1, background: active ? (isA ? "#eff6ff" : "#f0fdfa") : "transparent", position: "relative" }}
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; } }}
      >
        {active && <div style={{ position: "absolute", left: 0, top: 3, bottom: 3, width: 2, borderRadius: "0 2px 2px 0", background: activeColor }} />}
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.bg, color: m.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: t.display, flexShrink: 0 }}>
          {m.init}
        </div>
        {m.name}
        {m.status === "BLOCKED" && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} />}
      </div>
    );
  }

  const SectionLabel = ({ label }: { label: string }) => (
    <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: t.text2, padding: "14px 18px 6px" }}>{label}</div>
  );

  return (
    <div style={{ width: 224, height: "100vh", background: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "fixed", left: 0, top: 0, zIndex: 100, fontFamily: t.sans }}>
      {/* Logo */}
      <div style={{ padding: "22px 18px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 34, height: 34, background: `linear-gradient(135deg, ${t.trackA}, ${t.trackB})`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconOdin />
        </div>
        <div>
          <div style={{ fontFamily: t.display, fontWeight: 800, fontSize: 16, letterSpacing: "0.18em", color: t.text0 }}>ODIN</div>
          <div style={{ fontSize: 9, color: t.text1, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 1 }}>DeepSea Ops</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
        <SectionLabel label="Workspace" />
        <NavItem label="Dashboard"    v="dashboard" Icon={IconGrid} />
        <NavItem label="Sprint Board" v="sprint"   Icon={IconBoard} badge={2} />
        <NavItem label="Learning"     v="learning"  Icon={IconLayers} />
        <NavItem label="Project"      v="project"   Icon={IconTarget} />
        <NavItem label="Admin"        v="admin"     Icon={IconShield} />

        <SectionLabel label="Track A" />
        {MEMBERS.filter(m => m.track === "A").map(m => <MemberNavItem key={m.id} m={m} />)}

        <SectionLabel label="Track B" />
        {MEMBERS.filter(m => m.track === "B").map(m => <MemberNavItem key={m.id} m={m} />)}
      </nav>

      {/* Footer — Nick as logged-in user */}
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${t.trackB}, ${t.trackA})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>N</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: t.text0 }}>Nick</div>
          <div style={{ fontSize: 10, color: t.text2, textTransform: "uppercase", letterSpacing: "0.12em" }}>Admin · Track B</div>
        </div>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", marginLeft: "auto" }} />
      </div>
    </div>
  );
}

// ─── View: Dashboard ─────────────────────────────────────────────────────────
function DashboardView({ onMember }: { onMember: (id: string) => void }) {
  return (
    <div>
      <PageHeader title="Overview" sub="Thursday, Feb 27 2026 · 6 members · 2 active tracks">
        <Btn>Export</Btn>
        <Btn primary>+ New Sprint</Btn>
      </PageHeader>

      {/* Sprint card */}
      <Panel style={{ padding: "20px 24px", marginBottom: 20, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${t.trackA} 0%, ${t.trackB} 60%, transparent 100%)` }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: t.trackA, fontFamily: t.mono, marginBottom: 4 }}>Active Sprint</div>
            <div style={{ fontFamily: t.display, fontSize: 17, fontWeight: 700, color: t.text0 }}>{SPRINT.name}</div>
            <div style={{ fontSize: 11, color: t.text1, marginTop: 3 }}>{SPRINT.week}</div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {([["Done", SPRINT.done, "#15803d"], ["Active", SPRINT.active, t.trackA], ["Blocked", SPRINT.blocked, "#dc2626"], ["Todo", SPRINT.todo, t.text1]] as const).map(([label, val, color]) => (
              <div key={label} style={{ textAlign: "right" }}>
                <div style={{ fontFamily: t.mono, fontSize: 19, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em", color: t.text1, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${SPRINT.pct}%`, borderRadius: 3, background: `linear-gradient(90deg, ${t.trackA}, ${t.trackB})` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 11, color: t.text2 }}>
          <span>{SPRINT.total} total tasks this sprint</span>
          <span style={{ fontFamily: t.mono, color: t.trackB, fontWeight: 700 }}>{SPRINT.pct}% complete</span>
        </div>
      </Panel>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 }}>
        {[
          { label: "Done",        val: 17, color: "#16a34a", bg: t.surface,  border: t.border,    thick: false },
          { label: "In Progress", val: 8,  color: t.trackA,  bg: t.surface,  border: t.border,    thick: false },
          { label: "Blocked",     val: 2,  color: "#dc2626", bg: "#fff8f8",  border: "#fca5a5",   thick: true },
          { label: "Todo",        val: 6,  color: t.text1,   bg: t.surface,  border: t.border,    thick: false },
        ].map(({ label, val, color, bg, border, thick }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderLeft: thick ? "3px solid #fca5a5" : undefined, borderRadius: t.radius, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: t.mono, fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: t.text1, marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracks side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div>
          <TrackHeader track="A" title="Claude Mastery" meta="8 modules · 4 members" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {MEMBERS.filter(m => m.track === "A").map(m => <MemberCard key={m.id} m={m} onClick={() => onMember(m.id)} />)}
          </div>
        </div>
        <div>
          <TrackHeader track="B" title="DeepClients AI Prep" meta="5 phases · 2 members" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {MEMBERS.filter(m => m.track === "B").map(m => <MemberCard key={m.id} m={m} onClick={() => onMember(m.id)} />)}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <Panel>
        <PanelHead>
          <span style={{ fontFamily: t.display, fontSize: 13, fontWeight: 700, color: t.text0 }}>Recent Activity</span>
          <span style={{ fontSize: 10, color: t.text2, fontFamily: t.mono }}>{ACTIVITY.length} events</span>
        </PanelHead>
        {ACTIVITY.map((a, i) => (
          <div key={i} style={{ padding: "11px 18px", borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${t.border}` : undefined, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: t.display, color: t.text1, flexShrink: 0 }}>{a.member[0]}</div>
            <div style={{ flex: 1, fontSize: 12, color: t.text0 }}><span style={{ fontWeight: 600 }}>{a.member}</span> {a.action} <span style={{ color: t.text1 }}>{a.item}</span></div>
            <SourceBadge source={a.source} />
            <span style={{ fontSize: 10, color: t.text2, minWidth: 50, textAlign: "right" }}>{a.when}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

// ─── View: Sprint Board ───────────────────────────────────────────────────────
function SprintBoardView() {
  const cols = [
    { status: "TODO",        label: "Todo",        bg: "#f8fafc", headBg: "#f1f5f9", border: "#cbd5e1", color: "#64748b" },
    { status: "IN_PROGRESS", label: "In Progress", bg: "#eff6ff", headBg: "#dbeafe", border: "#93c5fd", color: "#1e40af" },
    { status: "DONE",        label: "Done",        bg: "#f0fdf4", headBg: "#dcfce7", border: "#86efac", color: "#15803d" },
    { status: "BLOCKED",     label: "Blocked",     bg: "#fff8f8", headBg: "#fee2e2", border: "#fca5a5", color: "#b91c1c" },
  ];

  return (
    <div>
      <PageHeader title="Sprint Board" sub={`${SPRINT.name} · ${SPRINT.total} tasks`}>
        <Btn primary>+ Add Task</Btn>
      </PageHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, alignItems: "start" }}>
        {cols.map(col => {
          const tasks = TASKS.filter(tk => tk.status === col.status);
          return (
            <div key={col.status}>
              <div style={{ background: col.headBg, border: `1px solid ${col.border}`, borderRadius: t.radius, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: t.display, fontSize: 12, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.label}</span>
                <span style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 700, color: col.color }}>{tasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks.map(task => {
                  const m = memberById(task.assignee);
                  return (
                    <div
                      key={task.id}
                      style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: t.radius, padding: "12px 13px", cursor: "pointer", transition: "box-shadow 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 500, color: t.text0, lineHeight: 1.45, marginBottom: 10 }}>{task.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.bg, color: m.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: t.display, flexShrink: 0 }}>{m.init}</div>
                        <PriBadge pri={task.pri} />
                        <span style={{ marginLeft: "auto", fontSize: 9, fontFamily: t.mono, color: t.text2, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, border: `1px solid ${t.border}` }}>{task.tag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── View: Member Profile ─────────────────────────────────────────────────────
function MemberView({ memberId }: { memberId: string }) {
  const m = memberById(memberId);
  const isA = m.track === "A";
  const trackColor = isA ? t.trackA : t.trackB;
  const modules = isA ? MODULES_A : MODULES_B;
  const memberTasks = TASKS.filter(tk => tk.assignee === m.id);
  const pct = Math.round((m.done / m.total) * 100);
  const circ = 2 * Math.PI * 30;
  const memberActivity = ACTIVITY.filter(a => a.member === m.name || a.member === "System");

  return (
    <div>
      <PageHeader title={m.name} sub={`Track ${m.track} — ${isA ? "Claude Mastery" : "DeepClients AI Prep"} · Last active ${m.ago}`} />

      <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 20 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile card */}
          <Panel style={{ padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 20, borderBottom: `1px solid ${t.border}`, marginBottom: 16 }}>
              {/* Progress ring */}
              <div style={{ position: "relative", marginBottom: 14 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke={trackColor} strokeWidth="6"
                    strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round"
                    transform="rotate(-90 40 40)" />
                  <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill={t.text0} fontFamily="Space Mono, monospace">{pct}%</text>
                </svg>
              </div>
              <Avatar m={m} size={48} />
              <div style={{ fontFamily: t.display, fontSize: 18, fontWeight: 700, color: t.text0, marginTop: 10 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: t.text1, marginTop: 4 }}>{m.done}/{m.total} {isA ? "modules" : "phases"} complete</div>
              <div style={{ marginTop: 10 }}><StatusBadge status={m.status} /></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {[
                { val: memberTasks.filter(tk => tk.status === "DONE").length,        label: "Done",    color: "#15803d" },
                { val: memberTasks.filter(tk => tk.status === "IN_PROGRESS").length, label: "Active",  color: t.trackA },
                { val: memberTasks.filter(tk => tk.status === "BLOCKED").length,     label: "Blocked", color: "#dc2626" },
              ].map(({ val, label, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: t.mono, fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: t.text1, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Module completion */}
          <Panel>
            <PanelHead>
              <span style={{ fontFamily: t.display, fontSize: 12, fontWeight: 700, color: t.text0 }}>Module Progress</span>
            </PanelHead>
            {modules.map((mod, i) => {
              const done = mod.by.includes(m.init);
              return (
                <div key={i} style={{ padding: "9px 16px", borderBottom: i < modules.length - 1 ? `1px solid ${t.border}` : undefined, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${done ? trackColor : t.border}`, background: done ? trackColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {done && <IconCheck />}
                  </div>
                  <span style={{ fontSize: 10, fontFamily: t.mono, color: t.text2, minWidth: 24 }}>M{mod.n}</span>
                  <span style={{ fontSize: 12, color: done ? t.text0 : t.text2, fontWeight: done ? 500 : 400, flex: 1 }}>{mod.title}</span>
                  {mod.state === "locked" && !done && <IconLock />}
                </div>
              );
            })}
          </Panel>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tasks */}
          <Panel>
            <PanelHead>
              <span style={{ fontFamily: t.display, fontSize: 13, fontWeight: 700, color: t.text0 }}>Assigned Tasks</span>
              <span style={{ fontSize: 10, fontFamily: t.mono, color: t.text2, background: "#f1f5f9", border: `1px solid ${t.border}`, borderRadius: 10, padding: "1px 7px" }}>{memberTasks.length}</span>
            </PanelHead>
            {memberTasks.length === 0
              ? <div style={{ padding: "20px 18px", fontSize: 12, color: t.text2, textAlign: "center" }}>No tasks assigned</div>
              : memberTasks.map((task, i) => (
                <div key={task.id} style={{ padding: "12px 18px", borderBottom: i < memberTasks.length - 1 ? `1px solid ${t.border}` : undefined, display: "flex", alignItems: "center", gap: 10 }}>
                  <StatusBadge status={task.status} />
                  <span style={{ flex: 1, fontSize: 12, color: t.text0 }}>{task.title}</span>
                  <PriBadge pri={task.pri} />
                  <span style={{ fontSize: 9, fontFamily: t.mono, color: t.text2, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, border: `1px solid ${t.border}` }}>{task.tag}</span>
                </div>
              ))
            }
          </Panel>

          {/* Activity */}
          <Panel>
            <PanelHead>
              <span style={{ fontFamily: t.display, fontSize: 13, fontWeight: 700, color: t.text0 }}>Activity Log</span>
            </PanelHead>
            {memberActivity.length === 0
              ? <div style={{ padding: "20px 18px", fontSize: 12, color: t.text2, textAlign: "center" }}>No recent activity</div>
              : memberActivity.map((a, i) => (
                <div key={i} style={{ padding: "11px 18px", borderBottom: i < memberActivity.length - 1 ? `1px solid ${t.border}` : undefined, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: t.display, color: t.text1, flexShrink: 0 }}>{a.member[0]}</div>
                  <div style={{ flex: 1, fontSize: 12, color: t.text0 }}><span style={{ fontWeight: 600 }}>{a.member}</span> {a.action} <span style={{ color: t.text1 }}>{a.item}</span></div>
                  <SourceBadge source={a.source} />
                  <span style={{ fontSize: 10, color: t.text2 }}>{a.when}</span>
                </div>
              ))
            }
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─── View: Learning Track ─────────────────────────────────────────────────────
function LearningView() {
  const [activeTrack, setActiveTrack] = useState<"A" | "B">("A");
  const modules = activeTrack === "A" ? MODULES_A : MODULES_B;
  const trackColor = activeTrack === "A" ? t.trackA : t.trackB;
  const trackMembers = MEMBERS.filter(m => m.track === activeTrack);
  const totalPossible = modules.reduce((acc, mod) => acc + mod.total, 0);
  const totalDone = modules.reduce((acc, mod) => acc + mod.by.length, 0);
  const teamPct = Math.round((totalDone / totalPossible) * 100);

  return (
    <div>
      <PageHeader title="Learning Track" sub="Module progress + Show & Tell wall">
        <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 8, padding: 3 }}>
          {(["A", "B"] as const).map(tr => (
            <button key={tr} onClick={() => setActiveTrack(tr)} style={{ padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: t.sans, background: activeTrack === tr ? t.surface : "transparent", color: activeTrack === tr ? t.text0 : t.text1, boxShadow: activeTrack === tr ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
              Track {tr}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Track summary bar */}
      <Panel style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: t.text2, marginBottom: 2 }}>Track {activeTrack}</div>
          <div style={{ fontFamily: t.display, fontSize: 14, fontWeight: 700, color: t.text0 }}>{activeTrack === "A" ? "Claude Mastery" : "DeepClients AI Prep"}</div>
        </div>
        <div style={{ width: 1, height: 40, background: t.border }} />
        {[
          { val: modules.length,                                       label: "Modules",      color: t.trackA },
          { val: totalDone,                                            label: "Completions",  color: "#15803d" },
          { val: modules.filter(m => m.state === "active").length,     label: "In Progress",  color: t.trackA },
          { val: modules.filter(m => m.state === "locked").length,     label: "Locked",       color: t.text2 },
        ].map(({ val, label, color }) => (
          <div key={label} style={{ textAlign: "center", minWidth: 60 }}>
            <div style={{ fontFamily: t.mono, fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: t.text1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
        <div style={{ width: 1, height: 40, background: t.border }} />
        <div style={{ flex: 1 }}>
          {trackMembers.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Avatar m={m} size={22} />
              <div style={{ fontSize: 11, color: t.text0, minWidth: 60 }}>{m.name}</div>
              <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${(m.done / m.total) * 100}%`, height: "100%", background: m.status === "BLOCKED" ? "#ef4444" : trackColor, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, fontFamily: t.mono, color: m.status === "BLOCKED" ? "#b91c1c" : t.text1, minWidth: 28, textAlign: "right" }}>{m.done}/{m.total}</div>
            </div>
          ))}
        </div>
        <div style={{ width: 1, height: 40, background: t.border }} />
        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: t.text1, marginBottom: 4 }}>Team progress</div>
          <div style={{ width: 120, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ width: `${teamPct}%`, height: "100%", background: trackColor, borderRadius: 3 }} />
          </div>
          <div style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 700, color: trackColor }}>{teamPct}%</div>
        </div>
      </Panel>

      {/* Module grid */}
      <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: t.text2, marginBottom: 12 }}>
        All Modules — Track {activeTrack}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {modules.map(mod => {
          const isDone   = mod.state === "done";
          const isActive = mod.state === "active";
          const borderC = isDone ? "#86efac" : isActive ? "#93c5fd" : t.border;
          const bgC     = isDone ? "#f0fdf4" : isActive ? "#eff6ff" : "#f8fafc";
          const headBg  = isDone ? "#dcfce7" : isActive ? "#dbeafe" : "#f1f5f9";
          const badge   = isDone   ? { bg: "#dcfce7", color: "#15803d", border: "#86efac", label: "COMPLETE" }
                        : isActive ? { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", label: "IN PROGRESS" }
                        :            { bg: "#f1f5f9", color: "#94a3b8", border: "#e2e8f0", label: "LOCKED" };
          return (
            <div key={mod.n} style={{ background: bgC, border: `1px solid ${borderC}`, borderRadius: t.radius, overflow: "hidden", opacity: mod.state === "locked" ? 0.72 : 1 }}>
              <div style={{ background: headBg, padding: "10px 14px", borderBottom: `1px solid ${borderC}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: t.mono, fontSize: 9, fontWeight: 700, color: t.text1, letterSpacing: "0.1em" }}>MODULE {mod.n}</span>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: isDone ? "#dcfce7" : isActive ? "#dbeafe" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isDone ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                          : isActive ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e40af" }} />
                          : <IconLock />}
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontFamily: t.display, fontSize: 13, fontWeight: 600, color: t.text0, marginBottom: 6 }}>{mod.title}</div>
                <div style={{ fontSize: 11, color: t.text1, lineHeight: 1.5, marginBottom: 12 }}>{mod.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: 4, fontSize: 7.5, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 6px" }}>{badge.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ display: "flex" }}>
                      {mod.by.map((init, i) => {
                        const mem = MEMBERS.find(m => m.init === init);
                        return mem ? (
                          <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: mem.bg, color: mem.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, fontFamily: t.display, border: "1px solid white", marginLeft: i > 0 ? -5 : 0 }}>{init}</div>
                        ) : null;
                      })}
                    </div>
                    <span style={{ fontSize: 9, fontFamily: t.mono, color: t.text1 }}>{mod.by.length}/{mod.total}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show & Tell Wall */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: t.text2 }}>Show & Tell Wall</div>
        <span style={{ fontSize: 11, color: t.trackA, cursor: "pointer" }}>View all submissions →</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {WALL.map((v, i) => {
          const mem = MEMBERS.find(m => m.init === v.mem);
          return (
            <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radius, overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <div style={{ height: 100, background: v.tbg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: v.pbg, border: `2px solid ${v.pbr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconPlay color={v.pc} />
                </div>
                <span style={{ position: "absolute", top: 8, left: 8, background: v.mb, color: "#fff", fontSize: 8, fontFamily: t.mono, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>{v.mod}</span>
                <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 9, fontFamily: t.mono, padding: "1px 5px", borderRadius: 3 }}>{v.dur}</span>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: t.text0, lineHeight: 1.4, marginBottom: 8 }}>{v.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {mem && <Avatar m={mem} size={20} />}
                  <span style={{ fontSize: 11, color: t.text1 }}>{v.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: t.text2 }}>{v.ago}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── View: Admin ──────────────────────────────────────────────────────────────
function AdminView() {
  const aMembers = MEMBERS.filter(m => m.track === "A");
  const bMembers = MEMBERS.filter(m => m.track === "B");
  const aDone  = aMembers.reduce((acc, m) => acc + m.done,  0);
  const aTotal = aMembers.reduce((acc, m) => acc + m.total, 0);
  const bDone  = bMembers.reduce((acc, m) => acc + m.done,  0);
  const bTotal = bMembers.reduce((acc, m) => acc + m.total, 0);
  const aPct = Math.round((aDone / aTotal) * 100);
  const bPct = Math.round((bDone / bTotal) * 100);
  const circ = 2 * Math.PI * 36;
  const blockedTasks = TASKS.filter(tk => tk.status === "BLOCKED");

  function TrackPanel({ track, members, done, total, pct, stats }: {
    track: "A" | "B";
    members: typeof MEMBERS[number][];
    done: number; total: number; pct: number;
    stats: { val: number; label: string; color: string }[];
  }) {
    const isA = track === "A";
    const trackColor = isA ? t.trackA : t.trackB;
    return (
      <Panel style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <span style={{ fontFamily: t.mono, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: isA ? "#dbeafe" : "#ccfbf1", color: isA ? "#1e40af" : "#0f766e", border: `1px solid ${isA ? "#93c5fd" : "#5eead4"}` }}>TRACK {track}</span>
            <div style={{ fontFamily: t.display, fontSize: 13, fontWeight: 700, color: t.text0, marginTop: 6 }}>{isA ? "Claude Mastery" : "DeepClients AI Prep"}</div>
            <div style={{ fontSize: 10, color: t.text1, marginTop: 2 }}>{isA ? "8 modules · 4 members" : "5 phases · 2 members"}</div>
          </div>
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="36" fill="none" stroke="#e2e8f0" strokeWidth="7" />
            <circle cx="45" cy="45" r="36" fill="none" stroke={trackColor} strokeWidth="7"
              strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round" transform="rotate(-90 45 45)" />
            <text x="45" y="49" textAnchor="middle" fontSize="14" fontWeight="700" fill={t.text0} fontFamily="Space Mono, monospace">{pct}%</text>
          </svg>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
          {stats.map(({ val, label, color }) => (
            <div key={label} style={{ textAlign: "center", background: "#f8fafc", borderRadius: 8, padding: "10px 6px" }}>
              <div style={{ fontFamily: t.mono, fontSize: 16, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: t.text1, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Avatar m={m} size={24} />
            <div style={{ fontSize: 11, color: t.text0, minWidth: 58 }}>{m.name}</div>
            <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(m.done / m.total) * 100}%`, height: "100%", background: m.status === "BLOCKED" ? "#ef4444" : trackColor, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 10, fontFamily: t.mono, color: m.status === "BLOCKED" ? "#b91c1c" : t.text1, minWidth: 30, textAlign: "right" }}>{m.done}/{m.total}</div>
            <StatusBadge status={m.status} />
          </div>
        ))}
      </Panel>
    );
  }

  return (
    <div>
      <PageHeader title="Admin View" sub="Full team visibility across both tracks">
        <Btn primary>Manage Team →</Btn>
      </PageHeader>

      {/* Track rings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <TrackPanel track="A" members={[...aMembers]} done={aDone} total={aTotal} pct={aPct}
          stats={[{ val: aDone, label: "Completions", color: "#15803d" }, { val: 6, label: "Active", color: t.trackA }, { val: 1, label: "Blocked", color: "#dc2626" }]} />
        <TrackPanel track="B" members={[...bMembers]} done={bDone} total={bTotal} pct={bPct}
          stats={[{ val: bDone, label: "Completions", color: "#15803d" }, { val: 3, label: "Active", color: t.trackB }, { val: 0, label: "Blocked", color: t.text2 }]} />
      </div>

      {/* Team table + right column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Team table */}
        <Panel>
          <PanelHead>
            <span style={{ fontFamily: t.display, fontSize: 13, fontWeight: 700, color: t.text0 }}>All Members</span>
            <span style={{ fontSize: 10, fontFamily: t.mono, color: t.text2, background: "#f1f5f9", border: `1px solid ${t.border}`, borderRadius: 10, padding: "1px 7px" }}>6</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: t.trackA, cursor: "pointer" }}>Manage →</span>
          </PanelHead>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: t.sans }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Member", "Track", "Modules", "Status", "Last active"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: t.text2, fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < MEMBERS.length - 1 ? `1px solid ${t.border}` : undefined }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar m={m} size={28} />
                      <div>
                        <div style={{ fontWeight: 600, color: t.text0 }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: t.text2 }}>#{m.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontFamily: t.mono, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: m.track === "A" ? "#dbeafe" : "#ccfbf1", color: m.track === "A" ? "#1e40af" : "#0f766e", border: `1px solid ${m.track === "A" ? "#93c5fd" : "#5eead4"}` }}>{m.track}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${(m.done / m.total) * 100}%`, height: "100%", background: m.status === "BLOCKED" ? "#ef4444" : m.track === "A" ? t.trackA : t.trackB, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, fontFamily: t.mono, color: m.status === "BLOCKED" ? "#b91c1c" : t.text1 }}>{m.done}/{m.total}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge status={m.status} /></td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: t.text2 }}>{m.ago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Blocked alerts */}
          <div style={{ background: "#fff8f8", border: "1px solid #fca5a5", borderRadius: t.radius, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
              <IconAlert />
              <span style={{ fontFamily: t.display, fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>Blocked — Needs Attention</span>
              <span style={{ marginLeft: "auto", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 9, fontFamily: t.mono, fontWeight: 700, padding: "1px 6px" }}>{blockedTasks.length}</span>
            </div>
            {blockedTasks.map((task, i) => {
              const m = memberById(task.assignee);
              return (
                <div key={task.id} style={{ padding: "12px 16px", borderBottom: i < blockedTasks.length - 1 ? "1px solid #fecaca" : undefined, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 9v4M12 17h.01"/></svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, color: t.text0, fontWeight: 500, marginBottom: 4 }}>{task.title}</div>
                    <div style={{ fontSize: 10, color: t.text1 }}><span style={{ fontWeight: 600 }}>{m.name}</span> · Track {m.track} · <span style={{ color: t.text2 }}>{task.tag}</span></div>
                  </div>
                  <button style={{ fontSize: 10, color: t.trackA, background: "transparent", border: "none", cursor: "pointer", fontFamily: t.sans, whiteSpace: "nowrap" }}>Resolve →</button>
                </div>
              );
            })}
          </div>

          {/* Sprint history */}
          <Panel>
            <PanelHead>
              <span style={{ fontFamily: t.display, fontSize: 12, fontWeight: 700, color: t.text0 }}>Sprint History</span>
              <span style={{ fontSize: 10, fontFamily: t.mono, color: t.text2 }}>7 sprints</span>
            </PanelHead>
            {SPRINT_HISTORY.map((sp, i) => (
              <div key={i} style={{ padding: "10px 16px", borderBottom: i < SPRINT_HISTORY.length - 1 ? `1px solid ${t.border}` : undefined, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: t.mono, fontSize: 11, color: t.text1, minWidth: 52 }}>Sprint {sp.n}</span>
                <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${sp.pct}%`, height: "100%", background: sp.active ? `linear-gradient(90deg, ${t.trackA}, #818cf8)` : "#86efac", borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: t.mono, fontSize: 10, color: t.text1, minWidth: 32 }}>{sp.pct}%</span>
                <span style={{ fontSize: 8.5, fontFamily: t.mono, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: sp.active ? "#dbeafe" : "#dcfce7", color: sp.active ? "#1e40af" : "#15803d", border: `1px solid ${sp.active ? "#93c5fd" : "#86efac"}` }}>
                  {sp.active ? "ACTIVE" : "DONE"}
                </span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─── View: Project Summary ────────────────────────────────────────────────────
function ProjectSummaryView() {
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});

  function calcAlignment(votes: VoteMap) {
    const given = Object.values(votes).filter((v): v is number => v !== null);
    if (given.length === 0) return 0;
    return Math.round((given.reduce((a, b) => a + b, 0) / given.length / 4) * 100);
  }

  function alignColor(pct: number) {
    return pct >= 75 ? "#15803d" : pct >= 50 ? "#d97706" : "#dc2626";
  }

  function alignChip(status: string): [string, string, string] {
    if (status === "ALIGNED")   return ["#dcfce7", "#15803d", "#86efac"];
    if (status === "REVIEWING") return ["#dbeafe", "#1e40af", "#93c5fd"];
    return ["#fef3c7", "#92400e", "#fcd34d"];
  }

  function Stars({ vote, id, editable }: { vote: number | null; id: string; editable?: boolean }) {
    const current = editable ? (myVotes[id] ?? vote) : vote;
    if (current === null && !editable)
      return <span style={{ fontSize: 9, color: t.text2, fontFamily: t.mono, background: "#f1f5f9", padding: "2px 7px", borderRadius: 4, border: `1px solid ${t.border}` }}>pending</span>;
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4].map(i => (
          <span
            key={i}
            onClick={editable ? (e) => { e.stopPropagation(); setMyVotes(prev => ({ ...prev, [id]: i })); } : undefined}
            style={{ cursor: editable ? "pointer" : "default", display: "flex" }}
          >
            <IconStar filled={current !== null && i <= current} />
          </span>
        ))}
      </div>
    );
  }

  // Overall alignment per member across all items
  const memberAlignments = MEMBERS.map(m => {
    const allVotes = [...OBJECTIVES, ...PROJ_TASKS].map(item => item.votes[m.id as keyof VoteMap]);
    const given = allVotes.filter((v): v is number => v !== null);
    const avg = given.length > 0 ? given.reduce((a, b) => a + b, 0) / given.length : 0;
    const pending = allVotes.filter(v => v === null).length;
    const myCurrentVote = myVotes[`member-${m.id}`];
    return { m, avg, pct: Math.round((avg / 4) * 100), pending, myCurrentVote };
  });

  const totalPendingVotes = [...OBJECTIVES, ...PROJ_TASKS]
    .flatMap(item => Object.values(item.votes))
    .filter(v => v === null).length;

  return (
    <div>
      <PageHeader title="Project Summary" sub={`${PROJECT.name} · Objectives, key tasks and team alignment`}>
        <Btn>Export</Btn>
        <Btn primary>+ New Objective</Btn>
      </PageHeader>

      {/* Bot PM card */}
      <div style={{ background: "linear-gradient(135deg, #3730a3 0%, #4c1d95 50%, #5b21b6 100%)", borderRadius: t.radius, padding: "20px 24px", marginBottom: 24, position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(79,70,229,0.3)" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 100, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>
          {/* Bot avatar */}
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconOdin />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: t.display, fontSize: 14, fontWeight: 700, color: "#fff" }}>DeepSeaBot PM</span>
              <span style={{ background: "rgba(255,255,255,0.18)", color: "#e9d5ff", fontSize: 8, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.12em", padding: "2px 8px", borderRadius: 4 }}>BOT · PM MODE</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginLeft: "auto" }}>Last synthesis {PROJECT.botLastSynth}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.65, marginBottom: 16, maxWidth: 680 }}>
              {PROJECT.botMessage}
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { val: totalPendingVotes, label: "Pending Votes",     color: "#fde68a" },
                { val: `${PROJECT.overallAlignment}%`, label: "Team Aligned", color: "#6ee7b7" },
                { val: OBJECTIVES.length, label: "Objectives",        color: "#93c5fd" },
                { val: OBJECTIVES.filter(o => o.status === "CONTESTED").length, label: "Contested", color: "#fca5a5" },
              ].map(({ val, label, color }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: t.mono, fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{val}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1.3 }}>{label}</span>
                </div>
              ))}
              <button style={{ marginLeft: "auto", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", color: "#fff", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: t.sans }}>
                Send nudge on Discord →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Per-member alignment cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 32 }}>
        {memberAlignments.map(({ m, avg, pct, pending }) => (
          <div key={m.id} style={{ background: t.surface, border: `1px solid ${avg === 0 ? t.border : avg >= 3 ? "#86efac" : avg >= 2 ? "#fcd34d" : "#fca5a5"}`, borderRadius: t.radius, padding: "14px 12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
            {avg > 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: avg >= 3 ? "#16a34a" : avg >= 2 ? "#d97706" : "#dc2626" }} />}
            <Avatar m={m} size={30} />
            <div style={{ fontFamily: t.display, fontSize: 12, fontWeight: 600, color: t.text0, marginTop: 8, marginBottom: 4 }}>{m.name}</div>
            <div style={{ fontFamily: t.mono, fontSize: 15, fontWeight: 700, color: avg === 0 ? t.text2 : alignColor(pct), lineHeight: 1 }}>
              {avg === 0 ? "—" : `${pct}%`}
            </div>
            <div style={{ fontSize: 9, color: t.text2, marginTop: 4 }}>
              {pending > 0 ? `${pending} pending` : "✓ all voted"}
            </div>
          </div>
        ))}
      </div>

      {/* Objectives section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: t.text2 }}>Objectives ({OBJECTIVES.length})</div>
        <span style={{ fontSize: 11, color: t.trackA, cursor: "pointer" }}>+ Propose objective</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
        {OBJECTIVES.map(obj => {
          const alignment = calcAlignment(obj.votes);
          const votedCount = Object.values(obj.votes).filter(v => v !== null).length;
          const [stBg, stColor, stBorder] = alignChip(obj.status);
          const myVoteKey = `obj-${obj.id}`;
          const myVote = myVotes[myVoteKey] ?? null;

          return (
            <Panel key={obj.id} style={{ borderColor: obj.status === "CONTESTED" ? "#fcd34d" : obj.status === "ALIGNED" ? "#86efac" : t.border }}>
              <div style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", gap: 20 }}>
                  {/* Left: info + alignment bar */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{ background: stBg, color: stColor, border: `1px solid ${stBorder}`, borderRadius: 4, fontSize: 8, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", textTransform: "uppercase" }}>{obj.status}</span>
                      {obj.source === "BOT"
                        ? <span style={{ background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd", borderRadius: 4, fontSize: 8, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px" }}>BOT PROPOSED</span>
                        : <span style={{ fontSize: 11, color: t.text1 }}>Proposed by <strong>{obj.source}</strong></span>
                      }
                      <span style={{ marginLeft: "auto", fontSize: 10, color: t.text2 }}>{votedCount}/6 voted</span>
                    </div>
                    <div style={{ fontFamily: t.display, fontSize: 16, fontWeight: 700, color: t.text0, marginBottom: 8 }}>{obj.title}</div>
                    <div style={{ fontSize: 12, color: t.text1, lineHeight: 1.7, marginBottom: 16 }}>{obj.desc}</div>

                    {/* Alignment bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 7, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", maxWidth: 300 }}>
                        <div style={{ width: `${alignment}%`, height: "100%", borderRadius: 4, background: alignColor(alignment) }} />
                      </div>
                      <span style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 700, color: alignColor(alignment), minWidth: 36 }}>{alignment}%</span>
                      <span style={{ fontSize: 10, color: t.text2 }}>team aligned</span>
                    </div>

                    {/* My vote (Nick = current user) */}
                    <div style={{ marginTop: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar m={MEMBERS[5]} size={22} />
                      <span style={{ fontSize: 11, color: t.text0, fontWeight: 500 }}>Your vote</span>
                      <Stars vote={myVote} id={myVoteKey} editable />
                      {myVote !== null && (
                        <span style={{ fontSize: 10, color: t.text1, marginLeft: 4 }}>
                          {myVote === 4 ? "Fully agree" : myVote === 3 ? "Mostly agree" : myVote === 2 ? "Partially agree" : "Disagree"}
                        </span>
                      )}
                      {myVote === null && <span style={{ fontSize: 10, color: t.text2, marginLeft: 4 }}>Click stars to vote</span>}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ width: 1, background: t.border, alignSelf: "stretch", flexShrink: 0 }} />

                  {/* Right: team votes */}
                  <div style={{ minWidth: 210, flexShrink: 0 }}>
                    <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: t.text2, marginBottom: 12 }}>Team Agreement (1–4 ★)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {MEMBERS.map(m => {
                        const vote = obj.votes[m.id as keyof VoteMap];
                        return (
                          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar m={m} size={22} />
                            <span style={{ fontSize: 11, color: t.text0, fontWeight: 500, minWidth: 60 }}>{m.name}</span>
                            <Stars vote={vote} id={`${obj.id}-${m.id}`} />
                            {vote !== null && (
                              <span style={{ fontSize: 9, fontFamily: t.mono, color: vote >= 3 ? "#15803d" : vote === 2 ? "#d97706" : "#dc2626", marginLeft: 2 }}>{vote}/4</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Key Tasks section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: t.text2 }}>Key Tasks ({PROJ_TASKS.length})</div>
        <span style={{ fontSize: 11, color: t.trackA, cursor: "pointer" }}>+ Add task</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PROJ_TASKS.map(task => {
          const alignment = calcAlignment(task.votes);
          const votedCount = Object.values(task.votes).filter(v => v !== null).length;
          const [stBg, stColor, stBorder] = alignChip(task.status);
          const myVoteKey = `task-${task.id}`;
          const myVote = myVotes[myVoteKey] ?? null;
          const trackBg  = task.track === "A" ? "#dbeafe" : task.track === "B" ? "#ccfbf1" : "#ede9fe";
          const trackFg  = task.track === "A" ? "#1e40af" : task.track === "B" ? "#0f766e" : "#5b21b6";
          const trackBrd = task.track === "A" ? "#93c5fd" : task.track === "B" ? "#5eead4" : "#c4b5fd";

          return (
            <Panel key={task.id}>
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 20 }}>
                {/* Left info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ background: stBg, color: stColor, border: `1px solid ${stBorder}`, borderRadius: 4, fontSize: 8, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 7px", textTransform: "uppercase" }}>{task.status}</span>
                    <span style={{ background: trackBg, color: trackFg, border: `1px solid ${trackBrd}`, borderRadius: 4, fontSize: 8, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 7px" }}>TRACK {task.track}</span>
                    <span style={{ fontSize: 10, color: t.text2 }}>Due {task.due}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: t.text2 }}>{votedCount}/6 voted</span>
                  </div>
                  <div style={{ fontFamily: t.display, fontSize: 13, fontWeight: 600, color: t.text0, marginBottom: 8 }}>{task.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 180, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${alignment}%`, height: "100%", borderRadius: 3, background: alignColor(alignment) }} />
                    </div>
                    <span style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 700, color: alignColor(alignment) }}>{alignment}%</span>
                    {/* My quick vote */}
                    <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar m={MEMBERS[5]} size={18} />
                      <span style={{ fontSize: 10, color: t.text1 }}>You:</span>
                      <Stars vote={myVote} id={myVoteKey} editable />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 50, background: t.border, flexShrink: 0 }} />

                {/* Compact member votes */}
                <div style={{ display: "flex", gap: 10 }}>
                  {MEMBERS.map(m => {
                    const vote = task.votes[m.id as keyof VoteMap];
                    return (
                      <div key={m.id} style={{ textAlign: "center" }}>
                        <Avatar m={m} size={22} />
                        <div style={{ marginTop: 4 }}>
                          {vote !== null ? (
                            <div style={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              {[1, 2, 3, 4].map(i => (
                                <svg key={i} width="7" height="7" viewBox="0 0 24 24" fill={i <= vote ? "#f59e0b" : "#e2e8f0"} stroke="none">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: 8, color: t.text2, fontFamily: t.mono, marginTop: 2 }}>—</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function MockupPage() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedMember, setSelectedMember] = useState("erika");

  function handleMember(id: string) {
    setSelectedMember(id);
    setView("member");
  }

  return (
    <div style={{ display: "flex", fontFamily: t.sans, background: t.bg, minHeight: "100vh" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
      `}</style>
      <Sidebar
        view={view}
        setView={setView}
        selectedMember={selectedMember}
        onMemberClick={handleMember}
      />
      <main style={{ marginLeft: 224, flex: 1, padding: "28px 32px 48px", overflowY: "auto", minHeight: "100vh" }}>
        {view === "dashboard" && <DashboardView onMember={handleMember} />}
        {view === "sprint"    && <SprintBoardView />}
        {view === "member"    && <MemberView memberId={selectedMember} />}
        {view === "learning"  && <LearningView />}
        {view === "admin"     && <AdminView />}
        {view === "project"   && <ProjectSummaryView />}
      </main>
    </div>
  );
}
