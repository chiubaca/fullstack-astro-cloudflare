import { drizzle } from "drizzle-orm/d1";
import { defineAction, z } from "astro:actions";
import { nanoid } from "nanoid";

import { todo } from "../../db/schema";
import { bucketAccess } from "../lib/bucket-access";

export const server = {
  createTodo: defineAction({
    accept: "form",
    input: z.object({
      text: z.string(),
      imageFile: z.instanceof(File).optional(),
    }),
    handler: async (input, context) => {
      console.log("🚀 ~ handler: ~ input:", input);
      const { locals } = context;
      const APP_DB = locals.runtime.env.APP_DB;

      let imageRef: string | undefined;

      // if image is submitted we need to store to r2
      if (input.imageFile) {
        console.log("🚀 ~ r2 upload!");
        const { putObject } = bucketAccess(context.locals.runtime.env);

        try {
          //convert input.imageFile into a buffer
          const fileBuffer = await input.imageFile.arrayBuffer();
          imageRef = nanoid(10) + "_" + input.imageFile.name;

          const r2Resp = await putObject({
            key: imageRef,
            body: fileBuffer as any,
            contentType: input.imageFile.type,
          });

          console.log("🚀 ~ handler: ~ r2Resp:", r2Resp);
        } catch (error) {
          console.warn("Internal error uploading to bucket", error);
        }
      }

      const db = drizzle(APP_DB);
      const resp = await db
        .insert(todo)
        .values({ text: input.text, imageRef })
        .returning();

      return { data: resp[0] };
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
