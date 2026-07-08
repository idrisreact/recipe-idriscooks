import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './user.schema';

export const cateringInquiries = pgTable(
  'catering_inquiries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 200 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    phone: varchar('phone', { length: 30 }),
    eventType: varchar('event_type', { length: 50 }).notNull(), // private-dinner, party, corporate, wedding, other
    eventDate: timestamp('event_date').notNull(),
    guestCount: integer('guest_count').notNull(),
    location: text('location'),
    budgetRange: varchar('budget_range', { length: 50 }),
    dietaryRequirements: text('dietary_requirements'),
    message: text('message'),
    status: varchar('status', { length: 20 }).default('new').notNull(), // new, contacted, quoted, confirmed, declined, archived
    metadata: jsonb('metadata').$type<{
      source?: string;
      utm?: Record<string, string>;
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('catering_inquiries_status_idx').on(table.status),
    createdAtIdx: index('catering_inquiries_created_at_idx').on(table.createdAt),
    emailIdx: index('catering_inquiries_email_idx').on(table.email),
  })
);

export type CateringInquiry = typeof cateringInquiries.$inferSelect;
export type NewCateringInquiry = typeof cateringInquiries.$inferInsert;
