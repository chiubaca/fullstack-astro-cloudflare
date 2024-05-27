import { defineConfig } from "drizzle-kit";

const config = defineConfig({
  schema: "./db/schema.ts",
  dialect: "sqlite",
  verbose: true,
  strict: true,
  driver: "d1-http",
  // dbCredentials:{
  //   wranglerConfigPath: "./wrangler.toml",
  //   dbName: 'fullstack-astro-cloudflare-db'
  // },
  dbCredentials: {
    accountId: "6fba426cae95d09cbd43f7d359f87924",
    databaseId: "307c117f-ab77-485c-a26e-deb8586cbd3b",
    token: "T8xfT6Gppkkd2UXC7g_qVeP3im6ajLQs3rJRmT2H",
  },
});


export default config