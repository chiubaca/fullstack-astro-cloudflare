import { defineConfig } from 'drizzle-kit'
export default defineConfig({
 schema: "./db/schema.ts",
  dialect: 'sqlite',
  verbose: true,
  strict: true,
  driver: 'd1'
})