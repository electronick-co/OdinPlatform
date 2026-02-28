import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@odin/db";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Show your open tasks and sprint progress");

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

  const sprint = await prisma.sprint.findFirst({
    where: { is_active: true },
    include: {
      tasks: { orderBy: { updated_at: "desc" } },
    },
  });

  if (!sprint) {
    await interaction.reply({
      content: "No active sprint found.",
      ephemeral: true,
    });
    return;
  }

  const myTasks = sprint.tasks.filter((t) => t.assignee_id === user.id);
  const allDone = sprint.tasks.filter((t) => t.status === "DONE").length;
  const pct = sprint.tasks.length
    ? Math.round((allDone / sprint.tasks.length) * 100)
    : 0;

  const todo = myTasks.filter((t) => t.status === "TODO");
  const inProgress = myTasks.filter((t) => t.status === "IN_PROGRESS");
  const blocked = myTasks.filter((t) => t.status === "BLOCKED");
  const done = myTasks.filter((t) => t.status === "DONE");

  const fmt = (tasks: typeof myTasks) =>
    tasks.length ? tasks.map((t) => `• ${t.title}`).join("\n") : "_none_";

  const embed = new EmbedBuilder()
    .setTitle(`Sprint: ${sprint.name}`)
    .setDescription(`Overall progress: **${pct}%** (${allDone}/${sprint.tasks.length} tasks done)`)
    .setColor(0x2563eb)
    .addFields(
      { name: "🔲 TODO", value: fmt(todo), inline: false },
      { name: "⚙️ In Progress", value: fmt(inProgress), inline: false },
      { name: "🚧 Blocked", value: fmt(blocked), inline: false },
      { name: "✅ Done", value: fmt(done), inline: false }
    )
    .setFooter({ text: `${user.name} · Track ${user.track}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
