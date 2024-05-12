import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "hybrid",
  vite: {
    ssr: {
      external: ["node:async_hooks"],
    },
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: "wrangler.toml",
    },
  }),
  experimental: {
    actions: true,
  },
});
