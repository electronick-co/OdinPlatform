import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@odin/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sprint = await prisma.sprint.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        include: { assignee: { select: { id: true, name: true, avatar_url: true, track: true } } },
        orderBy: { created_at: "desc" },
      },
      sprint_members: {
        include: { user: { select: { id: true, name: true, avatar_url: true, track: true } } },
      },
    },
  });

  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  return NextResponse.json(sprint);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, start_date, end_date, is_active } = body;

  // If activating this sprint, deactivate all others first
  if (is_active === true) {
    await prisma.sprint.updateMany({ data: { is_active: false } });
  }

  const sprint = await prisma.sprint.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(start_date !== undefined && { start_date: new Date(start_date) }),
      ...(end_date !== undefined && { end_date: new Date(end_date) }),
      ...(is_active !== undefined && { is_active }),
    },
  });

  return NextResponse.json(sprint);
}
