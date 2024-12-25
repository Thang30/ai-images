import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'

// Users table
export const UsersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

// Images table
export const ImagesTable = pgTable('images', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => UsersTable.id, { onDelete: 'cascade' }),
  image_url: text('image_url').notNull(),
  prompt: text('prompt').notNull(),
  negative_prompt: text('negative_prompt'),
  width: integer('width'),
  height: integer('height'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

// Types
export type User = InferSelectModel<typeof UsersTable>
export type NewUser = InferInsertModel<typeof UsersTable>
export type Image = InferSelectModel<typeof ImagesTable>
export type NewImage = InferInsertModel<typeof ImagesTable>

// Initialize Drizzle with Vercel Postgres
export const db = drizzle(sql)
