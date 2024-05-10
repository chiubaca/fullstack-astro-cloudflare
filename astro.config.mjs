import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  // or 'server'
  experimental: {
    actions: true
  },
  integrations: [react()]
});