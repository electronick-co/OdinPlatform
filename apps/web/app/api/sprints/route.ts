import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@odin/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sprints = await prisma.sprint.findMany({
    orderBy: { start_date: "desc" },
    include: {
      _count: { select: { tasks: true, sprint_members: true } },
    },
  });

  return NextResponse.json(sprints);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, start_date, end_date } = body;

  if (!name || !start_date || !end_date) {
    return NextResponse.json({ error: "name, start_date, and end_date are required" }, { status: 400 });
  }

  const sprint = await prisma.sprint.create({
    data: {
      name,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    },
  });

  return NextResponse.json(sprint, { status: 201 });
}
