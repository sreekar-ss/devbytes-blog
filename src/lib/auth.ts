import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const githubUsername = (profile as { login?: string })?.login;
      if (!githubUsername) return false;

      const allowedAuthors = (process.env.ALLOWED_AUTHORS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase());

      if (
        allowedAuthors.length > 0 &&
        allowedAuthors[0] !== "" &&
        !allowedAuthors.includes(githubUsername.toLowerCase())
      ) {
        return false;
      }

      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.githubUsername, githubUsername));

      const existingUser = existingUsers[0];

      if (!existingUser) {
        await db.insert(users).values({
          id: randomUUID(),
          name: user.name || githubUsername,
          email: user.email || `${githubUsername}@github.com`,
          image: user.image,
          githubUsername,
          role: "author",
          createdAt: new Date(),
        });
      } else {
        // Only update name/image if user hasn't customized them
        const updates: Record<string, string | null> = {};
        if (!existingUser.name || existingUser.name === existingUser.githubUsername) {
          updates.name = user.name || existingUser.name;
        }
        if (!existingUser.image) {
          updates.image = user.image || existingUser.image;
        }
        if (Object.keys(updates).length > 0) {
          await db
            .update(users)
            .set(updates)
            .where(eq(users.githubUsername, githubUsername));
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        const githubUsername = token.username as string;
        const dbUsers = await db
          .select()
          .from(users)
          .where(eq(users.githubUsername, githubUsername));

        const dbUser = dbUsers[0];

        if (dbUser) {
          const u = session.user as unknown as Record<string, unknown>;
          u.id = dbUser.id;
          u.githubUsername = dbUser.githubUsername;
          u.role = dbUser.role;
          u.bio = dbUser.bio;
        }
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.username = (profile as { login?: string }).login;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
