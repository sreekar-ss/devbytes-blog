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
      console.log("[Auth] GitHub login attempt:", { githubUsername, name: user.name, email: user.email });
      if (!githubUsername) return false;

      // Check if user is in allowed authors list
      const allowedAuthors = (process.env.ALLOWED_AUTHORS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase());

      console.log("[Auth] Allowed authors:", allowedAuthors, "| Checking:", githubUsername.toLowerCase());

      if (
        allowedAuthors.length > 0 &&
        allowedAuthors[0] !== "" &&
        !allowedAuthors.includes(githubUsername.toLowerCase())
      ) {
        console.log("[Auth] REJECTED - username not in allowed list");
        return false;
      }

      console.log("[Auth] ACCEPTED - proceeding with user creation/update");

      // Upsert user in database
      const existingUser = db
        .select()
        .from(users)
        .where(eq(users.githubUsername, githubUsername))
        .get();

      if (!existingUser) {
        db.insert(users)
          .values({
            id: randomUUID(),
            name: user.name || githubUsername,
            email: user.email || `${githubUsername}@github.com`,
            image: user.image,
            githubUsername,
            role: "author",
            createdAt: new Date(),
          })
          .run();
      } else {
        db.update(users)
          .set({
            name: user.name || existingUser.name,
            image: user.image || existingUser.image,
          })
          .where(eq(users.githubUsername, githubUsername))
          .run();
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        const githubUsername = token.username as string;
        const dbUser = db
          .select()
          .from(users)
          .where(eq(users.githubUsername, githubUsername))
          .get();

        if (dbUser) {
          (session.user as Record<string, unknown>).id = dbUser.id;
          (session.user as Record<string, unknown>).githubUsername =
            dbUser.githubUsername;
          (session.user as Record<string, unknown>).role = dbUser.role;
          (session.user as Record<string, unknown>).bio = dbUser.bio;
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

