"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "./tokens";

export type SidebarMember = {
  id: string;
  name: string;
  track: string;
  hasBlocked: boolean;
};

export type SidebarUser = {
  name: string | null | undefined;
  track: "A" | "B";
  role: "MEMBER" | "ADMIN";
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const IconBoard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);
const IconLayers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);
const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconOdin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
    <ellipse cx="12" cy="12" rx="9" ry="5.5"/><circle cx="12" cy="12" r="2.5" fill="#fff" stroke="none"/>
  </svg>
);

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { label: "Dashboard",    href: "/dashboard",         Icon: IconGrid },
  { label: "Sprint Board", href: "/dashboard/sprint",  Icon: IconBoard },
  { label: "Learning",     href: "/dashboard/learn",   Icon: IconLayers },
  { label: "Project",      href: "/dashboard/project", Icon: IconTarget },
  { label: "Admin",        href: "/dashboard/admin",   Icon: IconShield },
] as const;

function init(name: string) {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar({
  members,
  currentUser,
  blockedCount,
}: {
  members: SidebarMember[];
  currentUser: SidebarUser;
  blockedCount: number;
}) {
  const pathname = usePathname();
  const trackA = members.filter((m) => m.track === "A");
  const trackB = members.filter((m) => m.track === "B");

  return (
    <div
      style={{
        width: 224,
        height: "100vh",
        background: t.surface,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
        fontFamily: t.sans,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "22px 18px 20px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            background: `linear-gradient(135deg, ${t.trackA}, ${t.trackB})`,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconOdin />
        </div>
        <div>
          <div
            style={{
              fontFamily: t.display,
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "0.18em",
              color: t.text0,
            }}
          >
            ODIN
          </div>
          <div
            style={{
              fontSize: 9,
              color: t.text1,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginTop: 1,
            }}
          >
            DeepSea Ops
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
        <SectionLabel label="Workspace" />
        {NAV.map(({ label, href, Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          const badge =
            label === "Sprint Board" && blockedCount > 0
              ? blockedCount
              : undefined;
          return (
            <NavItem
              key={href}
              label={label}
              href={href}
              active={active}
              Icon={Icon}
              badge={badge}
            />
          );
        })}

        <SectionLabel label="Track A" />
        {trackA.map((m) => (
          <MemberItem
            key={m.id}
            m={m}
            active={pathname === `/dashboard/members/${m.id}`}
          />
        ))}

        <SectionLabel label="Track B" />
        {trackB.map((m) => (
          <MemberItem
            key={m.id}
            m={m}
            active={pathname === `/dashboard/members/${m.id}`}
          />
        ))}
      </nav>

      {/* Footer — logged-in user */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.trackB}, ${t.trackA})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {init(currentUser.name ?? "?")}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: t.text0 }}>
            {currentUser.name ?? "User"}
          </div>
          <div
            style={{
              fontSize: 10,
              color: t.text2,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            {currentUser.role} · Track {currentUser.track}
          </div>
        </div>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#16a34a",
            marginLeft: "auto",
          }}
        />
      </div>
    </div>
  );
}

// ─── Internal sub-components ─────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: t.text2,
        padding: "14px 18px 6px",
      }}
    >
      {label}
    </div>
  );
}

function NavItem({
  label,
  href,
  active,
  Icon,
  badge,
}: {
  label: string;
  href: string;
  active: boolean;
  Icon: () => React.ReactElement;
  badge?: number;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 18px",
          fontSize: 13,
          fontWeight: 500,
          color: active ? t.trackA : t.text1,
          background: active ? "#eff6ff" : "transparent",
          position: "relative",
        }}
      >
        {active && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 4,
              bottom: 4,
              width: 2,
              borderRadius: "0 2px 2px 0",
              background: t.trackA,
            }}
          />
        )}
        <span style={{ opacity: active ? 1 : 0.5, display: "flex" }}>
          <Icon />
        </span>
        {label}
        {badge !== undefined && (
          <span
            style={{
              marginLeft: "auto",
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              fontSize: 9,
              fontFamily: t.mono,
              fontWeight: 700,
              padding: "1px 6px",
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

function MemberItem({ m, active }: { m: SidebarMember; active: boolean }) {
  const isA = m.track === "A";
  const activeColor = isA ? t.trackA : t.trackB;
  return (
    <Link
      href={`/dashboard/members/${m.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "7px 18px",
          fontSize: 12,
          fontWeight: 500,
          color: active ? activeColor : t.text1,
          background: active ? (isA ? "#eff6ff" : "#f0fdfa") : "transparent",
          position: "relative",
        }}
      >
        {active && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 3,
              bottom: 3,
              width: 2,
              borderRadius: "0 2px 2px 0",
              background: activeColor,
            }}
          />
        )}
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
            fontSize: 10,
            fontWeight: 700,
            fontFamily: t.display,
            flexShrink: 0,
          }}
        >
          {init(m.name)}
        </div>
        {m.name}
        {m.hasBlocked && (
          <span
            style={{
              marginLeft: "auto",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#dc2626",
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </Link>
  );
}
