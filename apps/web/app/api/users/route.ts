import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@odin/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatar_url: true,
      track: true,
      role: true,
      tasks: {
        select: { id: true, status: true },
      },
      module_progresses: {
        select: { completed: true },
      },
      status_logs: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { created_at: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Shape into a summary format
  const summary = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar_url: u.avatar_url,
    track: u.track,
    role: u.role,
    tasks_total: u.tasks.length,
    tasks_done: u.tasks.filter((t) => t.status === "DONE").length,
    modules_completed: u.module_progresses.filter((m) => m.completed).length,
    last_activity: u.status_logs[0]?.created_at ?? null,
  }));

  return NextResponse.json(summary);
}
