import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  experimental: {
    actions: true,
  },
  integrations: [react()],
  adapter: cloudflare(),
});
