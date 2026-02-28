import { prisma } from "@odin/db";

export async function buildContext(userId?: string): Promise<string> {
  const sprint = await prisma.sprint.findFirst({
    where: { is_active: true },
    include: {
      tasks: {
        include: { assignee: true },
        orderBy: { updated_at: "desc" },
      },
    },
  });

  const recentLogs = await prisma.statusLog.findMany({
    take: 10,
    orderBy: { created_at: "desc" },
    include: { task: true, user: true },
  });

  const lines: string[] = [];

  if (sprint) {
    lines.push(`## Active Sprint: ${sprint.name}`);
    lines.push(
      `Dates: ${sprint.start_date.toDateString()} → ${sprint.end_date.toDateString()}`
    );

    const byStatus = {
      TODO: sprint.tasks.filter((t) => t.status === "TODO"),
      IN_PROGRESS: sprint.tasks.filter((t) => t.status === "IN_PROGRESS"),
      DONE: sprint.tasks.filter((t) => t.status === "DONE"),
      BLOCKED: sprint.tasks.filter((t) => t.status === "BLOCKED"),
    };

    lines.push(
      `Tasks: ${byStatus.TODO.length} TODO, ${byStatus.IN_PROGRESS.length} IN_PROGRESS, ${byStatus.DONE.length} DONE, ${byStatus.BLOCKED.length} BLOCKED`
    );

    if (userId) {
      const myTasks = sprint.tasks.filter((t) => t.assignee_id === userId);
      if (myTasks.length > 0) {
        lines.push(`\n### My Tasks (${myTasks.length})`);
        for (const t of myTasks) {
          lines.push(`- [${t.status}] ${t.title}`);
        }
      }
    }

    lines.push(`\n### All Sprint Tasks`);
    for (const t of sprint.tasks) {
      lines.push(`- [${t.status}] ${t.title} (${t.assignee.name})`);
    }
  } else {
    lines.push("## No active sprint found.");
  }

  if (recentLogs.length > 0) {
    lines.push(`\n## Recent Activity (last ${recentLogs.length} updates)`);
    for (const log of recentLogs) {
      lines.push(
        `- ${log.user.name}: "${log.task.title}" ${log.from_status} → ${log.to_status}${log.note ? ` (${log.note})` : ""}`
      );
    }
  }

  return lines.join("\n");
}
