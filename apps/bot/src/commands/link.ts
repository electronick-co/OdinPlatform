import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@odin/db";

export const data = new SlashCommandBuilder()
  .setName("link")
  .setDescription("Connect your Discord account to your ODIN profile")
  .addStringOption((opt) =>
    opt
      .setName("name")
      .setDescription("Your name as it appears in ODIN (e.g. Nick)")
      .setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const name = interaction.options.getString("name", true);

  const matches = await prisma.user.findMany({
    where: {
      name: { contains: name, mode: "insensitive" },
      discord_id: null,
    },
  });

  if (matches.length === 0) {
    const all = await prisma.user.findMany({
      where: { discord_id: null },
      select: { name: true },
    });
    const names = all.map((u) => `• ${u.name}`).join("\n");
    await interaction.reply({
      content: `No unlinked user found matching **"${name}"**.\n\nAvailable names:\n${names || "(none)"}`,
      ephemeral: true,
    });
    return;
  }

  if (matches.length > 1) {
    const names = matches.map((u) => `• ${u.name}`).join("\n");
    await interaction.reply({
      content: `Multiple matches for **"${name}"**. Be more specific:\n${names}`,
      ephemeral: true,
    });
    return;
  }

  const user = matches[0]!;
  await prisma.user.update({
    where: { id: user.id },
    data: { discord_id: interaction.user.id },
  });

  await interaction.reply({
    content: `✅ Linked! You are **${user.name}** (Track ${user.track}) in ODIN.`,
    ephemeral: true,
  });
}
