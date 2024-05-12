import { defineAction, z } from "astro:actions";

export const server = {
  createTodo: defineAction({
    accept: "form",
    input: z.object({
      text: z.string()

    }),
    handler: async ({ text }) => {
      console.log("🚀 ~ handler: ~ text:", text)

      // call a mailing service, or store to a database
      return text;
    },
  }),
};