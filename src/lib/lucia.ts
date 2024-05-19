import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/d1";
import { sessionTable, userTable } from "../../db/schema";
import { GitHub } from "arctic";

export const github = new GitHub(
	import.meta.env.GITHUB_CLIENT_ID,
	import.meta.env.GITHUB_CLIENT_SECRET
);

export function initialiseLucia(D1: D1Database) {
  const db = drizzle(D1);
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: import.meta.env.PROD,
      },
    },
    getUserAttributes: (attributes ) => {
      return { 
        githubId: attributes.github_id,
        username: attributes.username,
      };
    },
  });
 
  return lucia;
}

interface DatabaseUserAttributes {
	github_id: number;
	username: string;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof initialiseLucia;
		DatabaseUserAttributes: DatabaseUserAttributes
  }
}


