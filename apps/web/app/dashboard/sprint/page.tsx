import { prisma } from "@odin/db";
import { t } from "../_components/tokens";
import { priStyle } from "../_components/utils";

export const dynamic = "force-dynamic";

export default async function SprintBoardPage() {
  const activeSprint = await prisma.sprint.findFirst({
    where: { is_active: true },
    include: {
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, track: true } },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  const cols = [
    { status: "TODO",        label: "Todo",        bg: "#f8fafc", headBg: "#f1f5f9", border: "#cbd5e1", color: "#64748b" },
    { status: "IN_PROGRESS", label: "In Progress", bg: "#eff6ff", headBg: "#dbeafe", border: "#93c5fd", color: "#1e40af" },
    { status: "DONE",        label: "Done",        bg: "#f0fdf4", headBg: "#dcfce7", border: "#86efac", color: "#15803d" },
    { status: "BLOCKED",     label: "Blocked",     bg: "#fff8f8", headBg: "#fee2e2", border: "#fca5a5", color: "#b91c1c" },
  ] as const;

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
            Sprint Board
          </div>
          <div style={{ fontSize: 12, color: t.text1, marginTop: 4 }}>
            {activeSprint
              ? `${activeSprint.name} · ${activeSprint.tasks.length} tasks`
              : "No active sprint"}
          </div>
        </div>
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
          + Add Task
        </button>
      </div>

      {!activeSprint ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: t.radius,
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, color: t.text1, marginBottom: 8 }}>
            No active sprint
          </div>
          <div style={{ fontSize: 12, color: t.text2 }}>
            Create a sprint to start tracking tasks.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            alignItems: "start",
          }}
        >
          {cols.map((col) => {
            const tasks = activeSprint.tasks.filter(
              (tk) => tk.status === col.status
            );
            return (
              <div key={col.status}>
                {/* Column header */}
                <div
                  style={{
                    background: col.headBg,
                    border: `1px solid ${col.border}`,
                    borderRadius: t.radius,
                    padding: "10px 14px",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.display,
                      fontSize: 12,
                      fontWeight: 700,
                      color: col.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      fontFamily: t.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      color: col.color,
                    }}
                  >
                    {tasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {tasks.map((task) => {
                    const p = priStyle(task.priority);
                    const isA = task.assignee.track === "A";
                    return (
                      <div
                        key={task.id}
                        style={{
                          background: col.bg,
                          border: `1px solid ${col.border}`,
                          borderRadius: t.radius,
                          padding: "12px 13px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: t.text0,
                            lineHeight: 1.45,
                            marginBottom: 10,
                          }}
                        >
                          {task.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          {/* Assignee avatar */}
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: isA ? "#dbeafe" : "#ccfbf1",
                              color: isA ? "#1e40af" : "#0f766e",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              fontWeight: 700,
                              fontFamily: t.display,
                              flexShrink: 0,
                            }}
                          >
                            {task.assignee.name[0]?.toUpperCase()}
                          </div>
                          {/* Priority badge */}
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
                          {/* Due date */}
                          {task.due_date && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 9,
                                fontFamily: t.mono,
                                color: t.text2,
                                background: "#f1f5f9",
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: `1px solid ${t.border}`,
                              }}
                            >
                              {task.due_date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div
                      style={{
                        background: col.bg,
                        border: `1px dashed ${col.border}`,
                        borderRadius: t.radius,
                        padding: "20px",
                        textAlign: "center",
                        fontSize: 11,
                        color: col.color,
                        opacity: 0.6,
                      }}
                    >
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
