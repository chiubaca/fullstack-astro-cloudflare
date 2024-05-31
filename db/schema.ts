import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const message = sqliteTable("message", {
  id: integer("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  text: text("text").notNull(),
  createdAt: text("timestamp")
    .notNull()
    .default(sql`(current_timestamp)`),
  imageRef: text("image_ref").unique(),
});

export const userTable = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  oauthId: text("oauth_id", { length: 255 }).unique().notNull(),
  authType: text("oauth_type", { enum: ["google", "github"] }).notNull(),
  avatarUrl: text("avatar_url"),
  userName: text("user_name").notNull(), // The user alias or handle name
  fullName: text("full_name").notNull(), // Full name of the user
  email: text("email").notNull(),
  createdAt: text("timestamp")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("timestamp")
    .notNull()
    .default(sql`(current_timestamp)`),
});
