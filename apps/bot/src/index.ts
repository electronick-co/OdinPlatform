import { Client, GatewayIntentBits } from "discord.js";
import { env } from "@odin/config";
import { prisma } from "@odin/db";

// Validate bot-specific env vars at startup
if (!env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN is not set. Check your .env file.");
  process.exit(1);
}

if (!env.DISCORD_GUILD_ID) {
  console.error("❌ DISCORD_GUILD_ID is not set. Check your .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async (c) => {
  try {
    const userCount = await prisma.user.count();
    const moduleCount = await prisma.module.count();
    const guild = c.guilds.cache.get(env.DISCORD_GUILD_ID!);

    console.log(`✅ Connected to Discord as ${c.user.tag}`);
    console.log(`📋 Guild: ${guild?.name ?? "Guild not found (check DISCORD_GUILD_ID)"}`);
    console.log(`👥 Users in DB: ${userCount}`);
    console.log(`📚 Modules in DB: ${moduleCount}`);
    console.log(`🚀 ODIN Bot is ready.`);
  } catch (error) {
    console.error("❌ Error during bot startup:", error);
    process.exit(1);
  }
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

client.login(env.DISCORD_TOKEN);
