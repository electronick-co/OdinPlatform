import { z } from "zod";

const schema = z.object({
  // Database — required everywhere
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Node environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Discord — required for bot, optional for web
  DISCORD_TOKEN: z.string().optional(),
  DISCORD_GUILD_ID: z.string().optional(),

  // NextAuth — required for web (Session 3)
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // Google OAuth — optional (Session 3)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = result.data;
export type Env = typeof env;
