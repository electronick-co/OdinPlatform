import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "@odin/db";

export const data = new SlashCommandBuilder()
  .setName("done")
  .setDescription("Mark a task as DONE")
  .addStringOption((opt) =>
    opt
      .setName("task")
      .setDescription("The task to mark as done")
      .setRequired(true)
      .setAutocomplete(true)
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

  const sprint = await prisma.sprint.findFirst({ where: { is_active: true } });
  if (!sprint) {
    await interaction.respond([]);
    return;
  }

  const tasks = await prisma.task.findMany({
    where: {
      assignee_id: user.id,
      sprint_id: sprint.id,
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    take: 25,
  });

  const focused = interaction.options.getFocused().toLowerCase();
  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(focused)
  );

  await interaction.respond(
    filtered.map((t) => ({ name: t.title, value: t.id }))
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

  const taskId = interaction.options.getString("task", true);
  const task = await prisma.task.findFirst({
    where: { id: taskId, assignee_id: user.id },
  });

  if (!task) {
    await interaction.reply({
      content: "Task not found or not assigned to you.",
      ephemeral: true,
    });
    return;
  }

  const prevStatus = task.status;
  await prisma.task.update({
    where: { id: task.id },
    data: { status: "DONE" },
  });

  await prisma.statusLog.create({
    data: {
      task_id: task.id,
      user_id: user.id,
      from_status: prevStatus,
      to_status: "DONE",
      source: "BOT",
    },
  });

  await interaction.reply({
    content: `✅ Marked **"${task.title}"** as DONE. Nice work, ${user.name}!`,
  });
}
