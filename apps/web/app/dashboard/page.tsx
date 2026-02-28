import { prisma } from "@odin/db";
import { t } from "./_components/tokens";
import { MemberCard, type MemberCardData } from "./_components/member-card";
import { timeAgo, deriveStatus, sourceColors } from "./_components/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Active sprint with tasks
  const activeSprint = await prisma.sprint.findFirst({
    where: { is_active: true },
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
          title: true,
          assignee_id: true,
        },
      },
    },
  });

  // 2. All users with module progress + last activity
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      track: true,
      module_progresses: { select: { completed: true } },
      status_logs: {
        take: 1,
        orderBy: { created_at: "desc" },
        select: { created_at: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // 3. Recent activity feed
  const recentActivity = await prisma.statusLog.findMany({
    take: 8,
    orderBy: { created_at: "desc" },
    include: {
      user: { select: { name: true } },
      task: { select: { title: true } },
    },
  });

  // ─── Derived sprint stats ───────────────────────────────────────────────────
  const tasksByUser = new Map<string, { status: string; title: string }[]>();
  if (activeSprint) {
    for (const task of activeSprint.tasks) {
      const list = tasksByUser.get(task.assignee_id) ?? [];
      list.push({ status: task.status, title: task.title });
      tasksByUser.set(task.assignee_id, list);
    }
  }

  const tasksDone    = activeSprint?.tasks.filter((tk) => tk.status === "DONE").length ?? 0;
  const tasksActive  = activeSprint?.tasks.filter((tk) => tk.status === "IN_PROGRESS").length ?? 0;
  const tasksBlocked = activeSprint?.tasks.filter((tk) => tk.status === "BLOCKED").length ?? 0;
  const tasksTodo    = activeSprint?.tasks.filter((tk) => tk.status === "TODO").length ?? 0;
  const tasksTotal   = activeSprint?.tasks.length ?? 0;
  const pct          = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  // ─── Build member card data ─────────────────────────────────────────────────
  const memberCards: MemberCardData[] = users.map((u) => {
    const userTasks = tasksByUser.get(u.id) ?? [];
    const status = deriveStatus(userTasks);
    const currentTask =
      userTasks.find((tk) => tk.status === "BLOCKED")?.title ??
      userTasks.find((tk) => tk.status === "IN_PROGRESS")?.title ??
      userTasks.find((tk) => tk.status === "TODO")?.title ??
      null;
    const modulesDone = u.module_progresses.filter((p) => p.completed).length;
    const modulesTotal = u.track === "A" ? 8 : 5;
    const lastActivity = u.status_logs[0]?.created_at?.toISOString() ?? null;

    return { id: u.id, name: u.name, track: u.track, status, currentTask, modulesDone, modulesTotal, lastActivity };
  });

  const trackA = memberCards.filter((m) => m.track === "A");
  const trackB = memberCards.filter((m) => m.track === "B");

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{ fontFamily: t.display, fontSize: 24, fontWeight: 700, color: t.text0 }}
          >
            Overview
          </div>
          <div style={{ fontSize: 12, color: t.text1, marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {users.length} members · 2 active tracks
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              color: t.text1,
              padding: "7px 14px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: t.sans,
            }}
          >
            Export
          </button>
          <button
            style={{
              background: t.trackA,
              border: "none",
              color: "#fff",
              padding: "7px 14px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: t.sans,
            }}
          >
            + New Sprint
          </button>
        </div>
      </div>

      {/* Active sprint card */}
      {activeSprint ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: t.radius,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            padding: "20px 24px",
            marginBottom: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${t.trackA} 0%, ${t.trackB} 60%, transparent 100%)`,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: t.trackA,
                  fontFamily: t.mono,
                  marginBottom: 4,
                }}
              >
                Active Sprint
              </div>
              <div
                style={{
                  fontFamily: t.display,
                  fontSize: 17,
                  fontWeight: 700,
                  color: t.text0,
                }}
              >
                {activeSprint.name}
              </div>
              <div style={{ fontSize: 11, color: t.text1, marginTop: 3 }}>
                {activeSprint.start_date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {activeSprint.end_date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {(
                [
                  ["Done",        tasksDone,    "#15803d"],
                  ["Active",      tasksActive,  t.trackA],
                  ["Blocked",     tasksBlocked, "#dc2626"],
                  ["Todo",        tasksTodo,    t.text1],
                ] as const
              ).map(([label, val, color]) => (
                <div key={label} style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: t.mono,
                      fontSize: 19,
                      fontWeight: 700,
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: t.text1,
                      marginTop: 2,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              height: 6,
              background: "#e2e8f0",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${t.trackA}, ${t.trackB})`,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 7,
              fontSize: 11,
              color: t.text2,
            }}
          >
            <span>{tasksTotal} total tasks this sprint</span>
            <span
              style={{
                fontFamily: t.mono,
                color: t.trackB,
                fontWeight: 700,
              }}
            >
              {pct}% complete
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: t.radius,
            padding: "24px",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: t.text1 }}>
            No active sprint. Create one to start tracking tasks.
          </div>
        </div>
      )}

      {/* Stat chips */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {(
          [
            { label: "Done",        val: tasksDone,    color: "#16a34a", bg: t.surface, border: t.border,   thick: false },
            { label: "In Progress", val: tasksActive,  color: t.trackA,  bg: t.surface, border: t.border,   thick: false },
            { label: "Blocked",     val: tasksBlocked, color: "#dc2626", bg: "#fff8f8", border: "#fca5a5",  thick: true  },
            { label: "Todo",        val: tasksTodo,    color: t.text1,   bg: t.surface, border: t.border,   thick: false },
          ] as const
        ).map(({ label, val, color, bg, border, thick }) => (
          <div
            key={label}
            style={{
              background: bg,
              border: `1px solid ${border}`,
              borderLeft: thick ? "3px solid #fca5a5" : undefined,
              borderRadius: t.radius,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: t.mono,
                  fontSize: 20,
                  fontWeight: 700,
                  color,
                  lineHeight: 1,
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: t.text1,
                  marginTop: 3,
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Track A / B member grids */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 28,
        }}
      >
        <div>
          <TrackHeader
            track="A"
            title="Claude Mastery"
            meta={`8 modules · ${trackA.length} members`}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}
          >
            {trackA.map((m) => (
              <MemberCard key={m.id} m={m} />
            ))}
            {trackA.length === 0 && (
              <div style={{ fontSize: 12, color: t.text2 }}>No Track A members yet.</div>
            )}
          </div>
        </div>
        <div>
          <TrackHeader
            track="B"
            title="DeepClients AI Prep"
            meta={`5 phases · ${trackB.length} members`}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}
          >
            {trackB.map((m) => (
              <MemberCard key={m.id} m={m} />
            ))}
            {trackB.length === 0 && (
              <div style={{ fontSize: 12, color: t.text2 }}>No Track B members yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <Panel>
        <PanelHead>
          <span
            style={{
              fontFamily: t.display,
              fontSize: 13,
              fontWeight: 700,
              color: t.text0,
            }}
          >
            Recent Activity
          </span>
          <span
            style={{ fontSize: 10, color: t.text2, fontFamily: t.mono }}
          >
            {recentActivity.length} events
          </span>
        </PanelHead>
        {recentActivity.length === 0 ? (
          <div
            style={{
              padding: "20px 18px",
              fontSize: 12,
              color: t.text2,
              textAlign: "center",
            }}
          >
            No activity yet — status updates will appear here.
          </div>
        ) : (
          recentActivity.map((a, i) => {
            const [srcBg, srcColor] = sourceColors(a.source);
            return (
              <div
                key={a.id}
                style={{
                  padding: "11px 18px",
                  borderBottom:
                    i < recentActivity.length - 1
                      ? `1px solid ${t.border}`
                      : undefined,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: t.display,
                    color: t.text1,
                    flexShrink: 0,
                  }}
                >
                  {a.user.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, fontSize: 12, color: t.text0 }}>
                  <span style={{ fontWeight: 600 }}>{a.user.name}</span>
                  {" moved "}
                  <span style={{ color: t.text1 }}>{a.task.title}</span>
                  {" to "}
                  <span style={{ fontWeight: 500 }}>{a.to_status.replace("_", " ")}</span>
                </div>
                <span
                  style={{
                    background: srcBg,
                    color: srcColor,
                    borderRadius: 4,
                    fontSize: 8,
                    fontFamily: t.mono,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    padding: "2px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.source}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: t.text2,
                    minWidth: 50,
                    textAlign: "right",
                  }}
                >
                  {timeAgo(a.created_at)}
                </span>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}

// ─── Server-safe primitives (used only in this file) ─────────────────────────
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: t.radius,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}

function PanelHead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

function TrackHeader({
  track,
  title,
  meta,
}: {
  track: "A" | "B";
  title: string;
  meta: string;
}) {
  const isA = track === "A";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <span
        style={{
          fontFamily: t.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.14em",
          padding: "3px 9px",
          borderRadius: 4,
          background: isA ? "#dbeafe" : "#ccfbf1",
          color: isA ? "#1e40af" : "#0f766e",
          border: `1px solid ${isA ? "#93c5fd" : "#5eead4"}`,
        }}
      >
        TRACK {track}
      </span>
      <span
        style={{
          fontFamily: t.display,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: t.text0,
        }}
      >
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: t.border }} />
      <span style={{ fontSize: 10, color: t.text2, fontFamily: t.mono }}>
        {meta}
      </span>
    </div>
  );
}
