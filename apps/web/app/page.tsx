import { prisma } from "@odin/db";

export default async function HomePage() {
  const moduleCount = await prisma.module.count();
  const trackACount = await prisma.module.count({ where: { track: "A" } });
  const trackBCount = await prisma.module.count({ where: { track: "B" } });

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        ODIN Platform
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        DeepSea Developments — Project Management
      </p>

      <div
        style={{
          background: "#f5f5f5",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#333" }}>
          Database Status
        </h2>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>{moduleCount} modules seeded</strong>
        </p>
        <p style={{ margin: "0.25rem 0", color: "#666" }}>
          Track A (Claude Mastery): {trackACount} modules
        </p>
        <p style={{ margin: "0.25rem 0", color: "#666" }}>
          Track B (DeepClients): {trackBCount} phases
        </p>
      </div>
    </main>
  );
}
