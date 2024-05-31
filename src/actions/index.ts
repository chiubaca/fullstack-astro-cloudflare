import { nanoid } from "nanoid";
import { drizzle } from "drizzle-orm/d1";
import { defineAction, z } from "astro:actions";

import { message } from "../../db/schema";
import { bucketAccess } from "../lib/bucket-access";

import type { Message } from "../types";

export const server = {
  createMessage: defineAction({
    accept: "form",
    input: z.object({
      text: z.string(),
      imageFile: z.instanceof(File).optional(),
    }),
    handler: async (
      input,
      context
    ): Promise<
      { type: "error"; message: string } | { type: "success"; data: Message }
    > => {
      const { locals } = context;
      const user = locals.user;

      if (!user) {
        return { type: "error", message: "unauthorised" };
      }

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
          console.error("Unhandled error uploading image to bucket", error);
          return { type: "error", message: "image upload error" };
        }
      }

      const db = drizzle(APP_DB);
      const resp = await db
        .insert(message)
        .values({ userId: user.id, text: input.text, imageRef })
        .returning();

      return { type: "success", data: resp[0] };
    },
  }),
};
