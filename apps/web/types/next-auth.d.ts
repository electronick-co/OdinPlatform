import type { DefaultSession } from "next-auth";

// Extend the built-in session types to include ODIN-specific fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      track: "A" | "B";
      role: "MEMBER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    track?: "A" | "B";
    role?: "MEMBER" | "ADMIN";
  }
}
