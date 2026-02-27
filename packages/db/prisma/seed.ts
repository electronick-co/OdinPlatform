import { PrismaClient, Track } from "@prisma/client";

const prisma = new PrismaClient();

const TRACK_A_MODULES = [
  {
    title: "Claude Fundamentals",
    description: "Core concepts, capabilities, and mental models for working with Claude AI",
    order: 1,
  },
  {
    title: "Prompt Engineering",
    description: "Crafting effective prompts for consistent, high-quality outputs across use cases",
    order: 2,
  },
  {
    title: "Context Management",
    description: "Managing conversation context, memory patterns, and long-horizon tasks",
    order: 3,
  },
  {
    title: "Tool Use & Function Calling",
    description: "Integrating external tools, APIs, and structured data with Claude",
    order: 4,
  },
  {
    title: "Agents & Automation",
    description: "Building autonomous agents and multi-step automated workflows",
    order: 5,
  },
  {
    title: "RAG & Knowledge Systems",
    description: "Retrieval-augmented generation, vector stores, and knowledge base design",
    order: 6,
  },
  {
    title: "Multimodal AI",
    description: "Working with images, documents, PDFs, and mixed-media inputs",
    order: 7,
  },
  {
    title: "Production & Deployment",
    description: "Shipping AI-powered applications to production with reliability and safety",
    order: 8,
  },
] as const;

const TRACK_B_PHASES = [
  {
    title: "Business Discovery & Positioning",
    description: "Identifying your niche, ideal client profile, and unique value proposition",
    order: 1,
  },
  {
    title: "Offer Design",
    description: "Crafting compelling AI-powered service offers with clear outcomes and pricing",
    order: 2,
  },
  {
    title: "Lead Generation System",
    description: "Building automated systems to attract and qualify ideal clients at scale",
    order: 3,
  },
  {
    title: "Sales Process",
    description: "Converting leads to clients with AI-assisted discovery and proposal workflows",
    order: 4,
  },
  {
    title: "Client Onboarding & Delivery",
    description: "Delivering exceptional results and building long-term client relationships",
    order: 5,
  },
] as const;

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing module data (safe order respecting foreign keys)
  await prisma.moduleProgress.deleteMany();
  await prisma.moduleChallenge.deleteMany();
  await prisma.module.deleteMany();

  // Seed Track A — Claude Mastery (8 modules)
  await prisma.module.createMany({
    data: TRACK_A_MODULES.map((m) => ({ ...m, track: Track.A })),
  });

  // Seed Track B — DeepClients AI Prep (5 phases)
  await prisma.module.createMany({
    data: TRACK_B_PHASES.map((m) => ({ ...m, track: Track.B })),
  });

  const trackACount = await prisma.module.count({ where: { track: Track.A } });
  const trackBCount = await prisma.module.count({ where: { track: Track.B } });

  console.log(
    `✅ Seed complete. Track A: ${trackACount} modules, Track B: ${trackBCount} phases`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
