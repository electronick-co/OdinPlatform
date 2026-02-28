import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@odin/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sprint_id = searchParams.get("sprint_id") ?? undefined;
  const assignee_id = searchParams.get("assignee_id") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const tasks = await prisma.task.findMany({
    where: {
      ...(sprint_id && { sprint_id }),
      ...(assignee_id && { assignee_id }),
      ...(status && { status: status as any }),
    },
    include: {
      assignee: { select: { id: true, name: true, avatar_url: true, track: true } },
      challenge: { select: { id: true, title: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { sprint_id, assignee_id, title, description, priority, due_date, challenge_id } = body;

  if (!sprint_id || !assignee_id || !title) {
    return NextResponse.json({ error: "sprint_id, assignee_id, and title are required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      sprint_id,
      assignee_id,
      title,
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(due_date !== undefined && { due_date: new Date(due_date) }),
      ...(challenge_id !== undefined && { challenge_id }),
    },
    include: {
      assignee: { select: { id: true, name: true, avatar_url: true, track: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
