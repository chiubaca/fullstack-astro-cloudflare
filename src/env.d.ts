/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />
/// <reference types="lucia" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {}
}

type User = import("lucia").User;

interface OAuthUser extends User {
  oauthId: string;
  username: string;
  avatarUrl: string;
}

/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    session: import("lucia").Session | null;
    user: OAuthUser | null;
  }
}
