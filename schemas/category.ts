import { pgTable, text, timestamp, varchar, AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { quiz } from './quiz'

/** 分类表 */

export const category = pgTable('categories', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  name: varchar('name', { length: 100 }).notNull(),
  pid: varchar('p_id').references((): AnyPgColumn => category.id, { onDelete: 'cascade' }),
  remark: text('remark'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const categoryRelations = relations(category, ({ one, many }) => ({
  quizzes: many(quiz),
  children: many(category, { relationName: 'categories' }),
  parent: one(category, { fields: [category.pid], references: [category.id], relationName: 'categories' }),
}))

export type InsertCategory = typeof category.$inferInsert
export type SelectCategory = typeof category.$inferSelect
