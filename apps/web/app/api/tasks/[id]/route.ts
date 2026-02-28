import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@odin/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { status, priority, note, source } = body;

  const existing = await prisma.task.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
    },
    include: {
      assignee: { select: { id: true, name: true, avatar_url: true, track: true } },
    },
  });

  // Create a StatusLog entry when the status changes
  if (status !== undefined && status !== existing.status) {
    await prisma.statusLog.create({
      data: {
        task_id: params.id,
        user_id: (session.user as any).id,
        from_status: existing.status,
        to_status: status,
        ...(note !== undefined && { note }),
        source: source ?? "WEB",
      },
    });
  }

  return NextResponse.json(task);
}
