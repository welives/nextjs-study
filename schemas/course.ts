import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { quizTable } from './quiz'
import { categoryTable } from './category'

/** 课程表 */

export const courseTable = pgTable('courses', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  cateId: varchar('cate_id')
    .notNull()
    .references(() => categoryTable.id, { onDelete: 'set null' }),
  cover: text("cover"),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const courseRelations = relations(courseTable, ({ one, many }) => ({
  quizzes: many(quizTable),
  category: one(categoryTable, { fields: [courseTable.cateId], references: [categoryTable.id] }),
}))
