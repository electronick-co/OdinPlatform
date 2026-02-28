import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@odin/db";

export const data = new SlashCommandBuilder()
  .setName("submit-cap")
  .setDescription("Submit a Cap.so recording for a learning module")
  .addStringOption((opt) =>
    opt
      .setName("module")
      .setDescription("The module you completed")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("url")
      .setDescription("Cap.so URL for your recording")
      .setRequired(true)
  );

export async function autocomplete(
  interaction: AutocompleteInteraction
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { discord_id: interaction.user.id },
  });
  if (!user) {
    await interaction.respond([]);
    return;
  }

  // Get modules for the user's track that aren't yet completed
  const completed = await prisma.moduleProgress.findMany({
    where: { user_id: user.id, completed: true },
    select: { module_id: true },
  });
  const completedIds = completed.map((p) => p.module_id);

  const modules = await prisma.module.findMany({
    where: {
      track: user.track,
      id: { notIn: completedIds },
    },
    orderBy: { order: "asc" },
    take: 25,
  });

  const focused = interaction.options.getFocused().toLowerCase();
  const filtered = modules.filter((m) =>
    m.title.toLowerCase().includes(focused)
  );

  await interaction.respond(
    filtered.map((m) => ({ name: m.title, value: m.id }))
  );
}

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

  const moduleId = interaction.options.getString("module", true);
  const url = interaction.options.getString("url", true);

  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module) {
    await interaction.reply({
      content: "Module not found.",
      ephemeral: true,
    });
    return;
  }

  await prisma.moduleProgress.upsert({
    where: { user_id_module_id: { user_id: user.id, module_id: moduleId } },
    update: { cap_url: url, completed: true, submitted_at: new Date() },
    create: {
      user_id: user.id,
      module_id: moduleId,
      cap_url: url,
      completed: true,
      submitted_at: new Date(),
    },
  });

  await interaction.reply({
    content: `🎬 Submitted Cap.so recording for **${module.title}**!\n${url}`,
  });
}
