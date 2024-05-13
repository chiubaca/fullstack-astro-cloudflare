import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const todo = sqliteTable('todo', {
    id: integer('id').primaryKey(),
    text: text('text').notNull(),
  }, 
);