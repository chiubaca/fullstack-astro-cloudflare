import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";

import * as schema from "../../../../db/schema";
import { initialiseGithubClient, initialiseLucia } from "../../../lib/lucia";

import type { APIContext } from "astro";

const githubUserSchema = z.object({
  id: z.number(), //110905198
  login: z.string(), //'chiubaca'
  name: z.string(), //'Alex Chiu'
  avatar_url: z.string(), //'https://avatars.githubusercontent.com/u/18376481?v=4'
  email: z.string().email(), //'alexchiu11@gmail.com',
});

export async function GET(context: APIContext): Promise<Response> {
  const github = initialiseGithubClient(context.locals.runtime.env);
  const lucia = initialiseLucia(context.locals.runtime.env.APP_DB);
  const db = drizzle(context.locals.runtime.env.APP_DB, { schema });
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("github_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "User-Agent": "astro-cloudflare-pages",
      },
    });
    const unValidatedGithubUser = await githubUserResponse.json();
    const githubUser = githubUserSchema.parse(unValidatedGithubUser);

    const existingUser = await db.query.userTable.findFirst({
      where: eq(schema.userTable.oauthId, String(githubUser.id)),
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return context.redirect("/");
    }

    const userId = generateIdFromEntropySize(10);

    await db.insert(schema.userTable).values({
      id: userId,
      oauthId: String(githubUser.id),
      authType: "github",
      avatarUrl: githubUser.avatar_url,
      userName: githubUser.login,
      fullName: githubUser.name,
      email: githubUser.email,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return context.redirect("/");
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}
