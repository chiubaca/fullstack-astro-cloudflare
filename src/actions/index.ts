import { drizzle } from "drizzle-orm/d1";
import { defineAction, getApiContext, z } from "astro:actions";

import { todo } from "../../db/schema";

export const server = {
  createTodo: defineAction({
    accept: "form",
    input: z.object({
      text: z.string(),
    }),
    handler: async ({ text }) => {
      const { locals } = getApiContext();
      const APP_DB = locals.runtime.env.APP_DB;

      const db = drizzle(APP_DB);
      const resp = await db.insert(todo).values({ text: text }).returning();

      return resp[0];
    },
  }),
};
