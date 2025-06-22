import {
  pgTable,
  text,
  serial,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'), // Optional, so no .notNull()
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Indexes for better query performance
  emailIdx: index('contacts_email_idx').on(table.email),
  createdAtIdx: index('contacts_created_at_idx').on(table.createdAt),
  nameIdx: index('contacts_name_idx').on(table.firstName, table.lastName),
  // Check constraints for data validation
  emailFormat: check('contacts_email_format', sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`),
}));

export const insertContactSchema = createInsertSchema(contacts, {
  // Make phone optional and add validation if needed
  phone: z.string().optional().refine(value => !value || /^[+0-9]+$/.test(value), {
    message: "Phone number must be valid or empty."
  }),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect; 