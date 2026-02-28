import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@odin/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar_url: true,
      track: true,
      role: true,
      tasks: {
        include: { challenge: { select: { id: true, title: true } } },
        orderBy: { created_at: "desc" },
      },
      module_progresses: {
        include: { module: { select: { id: true, title: true, track: true, order: true } } },
        orderBy: { module: { order: "asc" } },
      },
      status_logs: {
        orderBy: { created_at: "desc" },
        take: 20,
        include: { task: { select: { id: true, title: true } } },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}
