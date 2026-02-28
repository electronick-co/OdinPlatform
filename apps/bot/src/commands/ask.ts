import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { buildContext } from "../lib/context-builder";
import { askClaude } from "../lib/claude";
import { prisma } from "@odin/db";

export const data = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask ODIN a question about the project")
  .addStringOption((opt) =>
    opt
      .setName("question")
      .setDescription("What do you want to know?")
      .setRequired(true)
  );

const SYSTEM_PROMPT = `You are ODIN, an AI project manager for DeepSea Developments.
Your team has two tracks:
- Track A: Claude Mastery (8 modules) — members: Erika, Rodrigo, Alba, Jesus
- Track B: DeepClients AI Prep (5 phases) — members: Wladimir, Nick

Answer questions about the project, tasks, sprint, and team using the provided context.
Be concise (150 words max). If you don't know something, say so clearly.`;

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { discord_id: interaction.user.id },
  });

  if (!user) {
    await interaction.reply({
      content: "Run `/link` first to connect your Discord to ODIN.",
      ephemeral: true,
    });
    return;
  }

  const question = interaction.options.getString("question", true);

  await interaction.deferReply({ ephemeral: true });

  try {
    const context = await buildContext(user.id);
    const systemWithContext = `${SYSTEM_PROMPT}\n\n## Current Project State\n${context}`;
    const response = await askClaude(systemWithContext, question);
    await interaction.editReply(response);
  } catch (err) {
    console.error("Error in /ask:", err);
    await interaction.editReply(
      "❌ Failed to get answer. Check that ANTHROPIC_API_KEY is set."
    );
  }
}
