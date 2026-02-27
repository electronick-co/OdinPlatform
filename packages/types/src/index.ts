// ============================================================
// Shared application types — no external dependencies
// Prisma-generated types live in @odin/db and are imported
// directly from "@prisma/client" where needed.
// ============================================================

export type TrackId = "A" | "B";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type LogSource = "WEB" | "BOT" | "CRON";
export type UserRole = "MEMBER" | "ADMIN";

export interface TeamMember {
  id: string;
  name: string;
  track: TrackId;
  discordId?: string;
  avatarUrl?: string;
}

export interface SprintSummary {
  id: string;
  name: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  completedTasks: number;
  totalTasks: number;
  memberCount: number;
}

export interface ModuleSummary {
  id: string;
  title: string;
  track: TrackId;
  order: number;
  description?: string;
}

export interface ProgressEntry {
  userId: string;
  moduleId: string;
  completed: boolean;
  capUrl?: string;
  submittedAt?: Date;
}

export interface BotCommandContext {
  userId: string;
  guildId: string;
  channelId: string;
}
