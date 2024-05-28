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
      const { locals } = context;
      const APP_DB = locals.runtime.env.APP_DB;

      let imageRef: string | undefined;

      if (input.imageFile && input.imageFile.type.startsWith("image")) {
        const { putObject } = bucketAccess(context.locals.runtime.env);

        try {
          const fileBuffer = await input.imageFile.arrayBuffer();
          imageRef = nanoid(10) + "_" + input.imageFile.name;

          await putObject({
            key: imageRef,
            body: fileBuffer as any,
            contentType: input.imageFile.type,
          });
        } catch (error) {
          console.warn("Unhandled error uploading to bucket", error);
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
};
