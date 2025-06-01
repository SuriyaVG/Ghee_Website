import {
  pgTable,
  text,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';
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
});

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