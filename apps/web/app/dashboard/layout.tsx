import { auth } from "@/auth";
import { prisma } from "@odin/db";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/sidebar";
import { t } from "./_components/tokens";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const members = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      track: true,
      tasks: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

  const sidebarMembers = members.map((m) => ({
    id: m.id,
    name: m.name,
    track: m.track as string,
    hasBlocked: m.tasks.some((tk) => tk.status === "BLOCKED"),
  }));

  const blockedCount = sidebarMembers.filter((m) => m.hasBlocked).length;

  return (
    <div style={{ display: "flex", background: t.bg, minHeight: "100vh" }}>
      <Sidebar
        members={sidebarMembers}
        currentUser={{
          name: session.user.name,
          track: session.user.track ?? "A",
          role: session.user.role ?? "MEMBER",
        }}
        blockedCount={blockedCount}
      />
      <main
        style={{ marginLeft: 224, flex: 1, padding: "32px", minHeight: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}
