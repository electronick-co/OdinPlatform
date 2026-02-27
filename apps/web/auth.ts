import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@odin/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      // Upsert user in DB — track defaults to A, admin can update via DB/admin UI
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? undefined,
          avatar_url: user.image ?? null,
        },
        create: {
          email: user.email,
          name: user.name ?? user.email,
          avatar_url: user.image ?? null,
          track: "A",
          role: "MEMBER",
        },
      });
      return true;
    },

    async jwt({ token, user }) {
      // On first sign-in (user is defined), store DB fields in JWT
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, track: true, role: true },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.track = dbUser.track;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      if (token.track) (session.user as any).track = token.track;
      if (token.role) (session.user as any).role = token.role;
      return session;
    },
  },
});
