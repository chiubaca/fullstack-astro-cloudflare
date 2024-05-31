import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";

import * as schema from "../../../../db/schema";
import { initialiseGoogleClient, initialiseLucia } from "../../../lib/lucia";

import type { APIContext } from "astro";

const googleUserSchema = z.object({
  sub: z.string(), //123asd
  name: z.string(), //'Alex Chiu',
  given_name: z.string(), //'Alex',
  family_name: z.string(), //'Chiu',
  picture: z.string(), //'https://lh3.googleusercontent.com/abc',
  email: z.string().email(), //'alexchiu11@gmail.com',
});

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

    const unValidatedGoogleUser = await googleUserResponse.json();
    const googleUser = googleUserSchema.parse(unValidatedGoogleUser);

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
      authType: "google",
      avatarUrl: googleUser.picture,
      userName: googleUser.given_name,
      fullName: googleUser.name,
      email: googleUser.email,
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
