import { pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
}, table => ({
  emailUniqueIdx: uniqueIndex('users_email_unique_idx').on(table.email),
}));

export type User = typeof users.$inferSelect; 