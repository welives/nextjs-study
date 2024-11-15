import { pgTable, timestamp, varchar, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { testRecordTable } from './test-record'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export const userRoleEnums = pgEnum('role', [
  UserRole.ADMIN,
  UserRole.USER,
])

/** 用户表 */

export const userTable = pgTable('users', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  username: varchar('username', { length: 30 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 200 }).notNull(),
  role: userRoleEnums('role').notNull().default(UserRole.USER),
  status: boolean('status').notNull().default(true),
  canBeDeleted: boolean().notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const userRelations = relations(userTable, ({ many }) => ({
  testRecords: many(testRecordTable),
}))
