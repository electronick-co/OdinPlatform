export const TRACKS = {
  A: {
    name: "Claude Mastery",
    description: "8-module curriculum for mastering Claude AI",
    members: ["Erika", "Rodrigo", "Alba", "Jesus"],
    moduleCount: 8,
  },
  B: {
    name: "DeepClients AI Prep",
    description: "5-phase program for AI-powered client acquisition",
    members: ["Wladimir", "Nick"],
    moduleCount: 5,
  },
} as const;

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const LOG_SOURCES = ["WEB", "BOT", "CRON"] as const;
export type LogSource = (typeof LOG_SOURCES)[number];

export const USER_ROLES = ["MEMBER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
