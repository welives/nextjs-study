import { pgTable, timestamp, varchar, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export const roleEnums = pgEnum('role', [
  UserRole.ADMIN,
  UserRole.USER,
])

/** 用户表 */

export const user = pgTable('users', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  username: varchar('username', { length: 30 }).notNull().unique(),
  email: varchar('email', { length: 100 }).unique(),
  password: varchar('password', { length: 200 }).notNull(),
  role: roleEnums('role').notNull().default(UserRole.USER),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export type InsertUser = typeof user.$inferInsert
export type SelectUser = typeof user.$inferSelect
