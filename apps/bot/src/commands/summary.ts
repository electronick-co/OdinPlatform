import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { buildContext } from "../lib/context-builder";
import { askClaude } from "../lib/claude";
import { prisma } from "@odin/db";

export const data = new SlashCommandBuilder()
  .setName("summary")
  .setDescription("Get an AI-generated sprint summary");

const SYSTEM_PROMPT = `You are ODIN, an AI project manager for DeepSea Developments.
Your team has two tracks:
- Track A: Claude Mastery (8 modules) — members: Erika, Rodrigo, Alba, Jesus
- Track B: DeepClients AI Prep (5 phases) — members: Wladimir, Nick

Given the current sprint data, provide a concise summary (200 words max) covering:
1. Overall sprint health (% complete, any blockers)
2. Who is making good progress
3. What needs attention
4. One concrete recommendation

Be direct and motivating. Use bullet points. No fluff.`;

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

  await interaction.deferReply();

  try {
    const context = await buildContext(user.id);
    const response = await askClaude(SYSTEM_PROMPT, context);
    await interaction.editReply(response);
  } catch (err) {
    console.error("Error in /summary:", err);
    await interaction.editReply(
      "❌ Failed to generate summary. Check that ANTHROPIC_API_KEY is set."
    );
  }
}
