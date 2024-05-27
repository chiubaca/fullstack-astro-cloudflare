import { drizzle } from "drizzle-orm/d1";
import { defineAction, getApiContext, z } from "astro:actions";

import { todo } from "../../db/schema";

export const server = {
  createTodo: defineAction({
    accept: "form",
    input: z.object({
      text: z.string(),
    }),
    handler: async ({ text }, context) => {
      const { locals } = context;
      const APP_DB = locals.runtime.env.APP_DB;

      const db = drizzle(APP_DB);
      const resp = await db.insert(todo).values({ text: text }).returning();

      return resp[0];
    },
  }),

  fileUpload: defineAction({
    accept: "form",
    input: z.object({
      imageFile: z.instanceof(File),
    }),
    handler: async (input, context) => {
      console.log("🚀 ~ handler: ~ input:", input);

      const { locals } = context;
      const r2Bucket = locals.runtime.env.APP_BUCKET;

      const resp = await r2Bucket.put("local-image", input.imageFile, {
        httpMetadata: {
          contentType: input.imageFile.type,
        },
      });
      console.log("🚀 ~ handler: ~ resp:", resp);

      return "success!";
    },
  }),
};
