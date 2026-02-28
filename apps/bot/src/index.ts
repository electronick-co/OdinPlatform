import "./load-env"; // must be first — loads .env before any other module runs
import { createServer } from "http";
import {
  Client,
  GatewayIntentBits,
  InteractionType,
  REST,
  Routes,
} from "discord.js";
import { env } from "@odin/config";
import { prisma } from "@odin/db";
import { commands, commandBuilders } from "./commands";

// Health-check server — keeps Railway from sleeping the worker (production only)
if (process.env["NODE_ENV"] === "production") {
  const PORT = process.env["PORT"] ?? 3001;
  createServer((req, res) => {
    res.writeHead(200);
    res.end("OK");
  }).listen(PORT);
}

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

    // Register guild slash commands (instant propagation)
    if (env.DISCORD_CLIENT_ID) {
      const rest = new REST().setToken(env.DISCORD_TOKEN!);
      const body = commandBuilders.map((b) => b.toJSON());
      await rest.put(
        Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID!),
        { body }
      );
      console.log(`⚡ Registered ${body.length} slash commands`);
    } else {
      console.warn("⚠️  DISCORD_CLIENT_ID not set — skipping slash command registration");
    }

    console.log(`🚀 ODIN Bot is ready.`);
  } catch (error) {
    console.error("❌ Error during bot startup:", error);
    process.exit(1);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    const command = commands.get(interaction.commandName);
    if (!command?.autocomplete) return;
    try {
      await command.autocomplete(interaction);
    } catch (err) {
      console.error(`Autocomplete error for /${interaction.commandName}:`, err);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error executing /${interaction.commandName}:`, err);
    const msg = { content: "❌ Something went wrong.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

client.login(env.DISCORD_TOKEN);
