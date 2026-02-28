import { prisma } from "@odin/db";
import { notFound } from "next/navigation";
import { t } from "../../_components/tokens";
import { timeAgo, deriveStatus, statusStyle, priStyle, sourceColors } from "../../_components/utils";

export const dynamic = "force-dynamic";

export default async function MemberPage({
  params,
}: {
  params: { id: string };
}) {
  const [user, allModules] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          include: { sprint: { select: { name: true, is_active: true } } },
          orderBy: { updated_at: "desc" },
        },
        module_progresses: {
          select: { module_id: true, completed: true },
        },
        status_logs: {
          take: 20,
          orderBy: { created_at: "desc" },
          include: { task: { select: { title: true } } },
        },
      },
    }),
    prisma.module.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true, order: true, track: true },
    }),
  ]);

  if (!user) notFound();

  const trackModules = allModules.filter((m) => m.track === user.track);
  const completedModuleIds = new Set(
    user.module_progresses.filter((p) => p.completed).map((p) => p.module_id)
  );

  const modulesDone = completedModuleIds.size;
  const modulesTotal = trackModules.length;
  const pct = modulesTotal > 0 ? Math.round((modulesDone / modulesTotal) * 100) : 0;
  const circ = 2 * Math.PI * 30;

  const isA = user.track === "A";
  const trackColor = isA ? t.trackA : t.trackB;

  // Derive overall status from active sprint tasks, then all tasks
  const activeTasks = user.tasks.filter((tk) => tk.sprint.is_active);
  const status = deriveStatus(activeTasks.length > 0 ? activeTasks : user.tasks);

  const tasksDone    = user.tasks.filter((tk) => tk.status === "DONE").length;
  const tasksActive  = user.tasks.filter((tk) => tk.status === "IN_PROGRESS").length;
  const tasksBlocked = user.tasks.filter((tk) => tk.status === "BLOCKED").length;
  const lastActive   = user.status_logs[0]?.created_at ?? null;
  const st = statusStyle(status);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{ fontFamily: t.display, fontSize: 24, fontWeight: 700, color: t.text0 }}
        >
          {user.name}
        </div>
        <div style={{ fontSize: 12, color: t.text1, marginTop: 4 }}>
          Track {user.track} —{" "}
          {isA ? "Claude Mastery" : "DeepClients AI Prep"} · Last active{" "}
          {timeAgo(lastActive)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 20 }}>
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile card */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingBottom: 20,
                borderBottom: `1px solid ${t.border}`,
                marginBottom: 16,
              }}
            >
              {/* Progress ring */}
              <div style={{ position: "relative", marginBottom: 14 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40" cy="40" r="30"
                    fill="none" stroke="#e2e8f0" strokeWidth="6"
                  />
                  <circle
                    cx="40" cy="40" r="30"
                    fill="none"
                    stroke={trackColor}
                    strokeWidth="6"
                    strokeDasharray={`${(circ * pct) / 100} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                  <text
                    x="40" y="44"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill={t.text0}
                    fontFamily="Space Mono, monospace"
                  >
                    {pct}%
                  </text>
                </svg>
              </div>
              {/* Avatar */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: isA ? "#dbeafe" : "#ccfbf1",
                  color: isA ? "#1e40af" : "#0f766e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: t.display,
                }}
              >
                {user.name[0]?.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: t.display,
                  fontSize: 18,
                  fontWeight: 700,
                  color: t.text0,
                  marginTop: 10,
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: t.text1, marginTop: 4 }}>
                {modulesDone}/{modulesTotal}{" "}
                {isA ? "modules" : "phases"} complete
              </div>
              <div style={{ marginTop: 10 }}>
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
              </div>
            </div>

            {/* Task stats */}
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {(
                [
                  { val: tasksDone,    label: "Done",    color: "#15803d" },
                  { val: tasksActive,  label: "Active",  color: t.trackA  },
                  { val: tasksBlocked, label: "Blocked", color: "#dc2626" },
                ] as const
              ).map(({ val, label, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: t.mono,
                      fontSize: 18,
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
                      letterSpacing: "0.15em",
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

          {/* Module progress list */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: t.display,
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.text0,
                }}
              >
                {isA ? "Module" : "Phase"} Progress
              </span>
            </div>
            {trackModules.map((mod, i) => {
              const done = completedModuleIds.has(mod.id);
              return (
                <div
                  key={mod.id}
                  style={{
                    padding: "9px 16px",
                    borderBottom:
                      i < trackModules.length - 1
                        ? `1px solid ${t.border}`
                        : undefined,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1.5px solid ${done ? trackColor : t.border}`,
                      background: done ? trackColor : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {done && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: t.mono,
                      color: t.text2,
                      minWidth: 24,
                    }}
                  >
                    {String(mod.order).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: done ? t.text0 : t.text2,
                      fontWeight: done ? 500 : 400,
                      flex: 1,
                    }}
                  >
                    {mod.title}
                  </span>
                </div>
              );
            })}
            {trackModules.length === 0 && (
              <div
                style={{
                  padding: "20px 18px",
                  fontSize: 12,
                  color: t.text2,
                  textAlign: "center",
                }}
              >
                No modules found.
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Assigned tasks */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: t.display,
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.text0,
                }}
              >
                Assigned Tasks
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: t.mono,
                  color: t.text2,
                  background: "#f1f5f9",
                  border: `1px solid ${t.border}`,
                  borderRadius: 10,
                  padding: "1px 7px",
                }}
              >
                {user.tasks.length}
              </span>
            </div>
            {user.tasks.length === 0 ? (
              <div
                style={{
                  padding: "20px 18px",
                  fontSize: 12,
                  color: t.text2,
                  textAlign: "center",
                }}
              >
                No tasks assigned
              </div>
            ) : (
              user.tasks.map((task, i) => {
                const tst = statusStyle(task.status);
                const p = priStyle(task.priority);
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: "12px 18px",
                      borderBottom:
                        i < user.tasks.length - 1
                          ? `1px solid ${t.border}`
                          : undefined,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        background: tst.bg,
                        color: tst.color,
                        border: `1px solid ${tst.border}`,
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
                      {tst.label}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: t.text0 }}>
                      {task.title}
                    </span>
                    <span
                      style={{
                        background: p.bg,
                        color: p.color,
                        border: `1px solid ${p.border}`,
                        borderRadius: 4,
                        fontSize: 8,
                        fontFamily: t.mono,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "2px 6px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.priority}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: t.mono,
                        color: t.text2,
                        background: "#f1f5f9",
                        padding: "2px 6px",
                        borderRadius: 4,
                        border: `1px solid ${t.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.sprint.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Activity log */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: t.display,
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.text0,
                }}
              >
                Activity Log
              </span>
            </div>
            {user.status_logs.length === 0 ? (
              <div
                style={{
                  padding: "20px 18px",
                  fontSize: 12,
                  color: t.text2,
                  textAlign: "center",
                }}
              >
                No recent activity
              </div>
            ) : (
              user.status_logs.map((log, i) => {
                const [srcBg, srcColor] = sourceColors(log.source);
                const fromSt = statusStyle(log.from_status);
                const toSt   = statusStyle(log.to_status);
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: "11px 18px",
                      borderBottom:
                        i < user.status_logs.length - 1
                          ? `1px solid ${t.border}`
                          : undefined,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: t.text0 }}>
                        {log.task.title}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: t.text1,
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ color: fromSt.color }}>{fromSt.label}</span>
                        <span>→</span>
                        <span style={{ color: toSt.color }}>{toSt.label}</span>
                      </div>
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
                      {log.source}
                    </span>
                    <span style={{ fontSize: 10, color: t.text2 }}>
                      {timeAgo(log.created_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
