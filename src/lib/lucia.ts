import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/d1";
import { sessionTable, userTable } from "../../db/schema";
import { GitHub, Google } from "arctic";

export function initialiseGithubClient(env: Env) {
  return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET);
}

export function initialiseGoogleClient(env: Env) {
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CLIENT_REDIRECT_URL
  );
}

export function initialiseLucia(D1: D1Database) {
  const db = drizzle(D1);
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: import.meta.env.PROD,
      },
    },
    getUserAttributes: (attributes) => {
      const { avatarUrl, email, fullName, userName } = attributes;

      return {
        avatarUrl,
        userName,
        fullName,
        email,
      };
    },
  });
}

interface DatabaseUserAttributes {
  avatarUrl: string;
  userName: string;
  fullName: string;
  email: string;
}

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initialiseLucia>;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
