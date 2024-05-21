import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todo = sqliteTable("todo", {
  id: integer("id").primaryKey(),
  text: text("text").notNull(),
});

export const userTable = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  githubId: integer("github_id").unique(),
  googleId: integer("google_id").unique(),
  username: text("username"),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});
