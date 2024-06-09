import { defineConfig } from "drizzle-kit";

const config = defineConfig({
  schema: "./db/schema.ts",
  dialect: "sqlite",
  verbose: true,
  strict: true,
  driver: "d1-http",
});

export default config;
