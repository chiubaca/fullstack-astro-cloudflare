// pages/login/github/callback.ts
import { generateIdFromEntropySize } from "lucia";
import { OAuth2RequestError } from "arctic";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

import { initialiseGoogleClient, initialiseLucia } from "../../../lib/lucia";
import * as schema from "../../../../db/schema";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const google = initialiseGoogleClient(context.locals.runtime.env);
  const lucia = initialiseLucia(context.locals.runtime.env.APP_DB);
  const db = drizzle(context.locals.runtime.env.APP_DB, { schema });
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier =
    context.cookies.get("google_oauth_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );
    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    // TODO: Zod schema validation required here
    const googleUser: GoogleUser = await googleUserResponse.json();

    const existingUser = await db.query.userTable.findFirst({
      where: eq(schema.userTable.oauthId, googleUser.sub),
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
      oauthId: googleUser.sub,
      username: googleUser.name,
      authType: "google",
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

interface GoogleUser {
  sub: string;
  name: string;
  avatar: string;
}
