import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { quiz } from './quiz'
import { category } from './category'

/** 课程表 */

export const course = pgTable('courses', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  cateId: varchar('cate_id')
    .notNull()
    .references(() => category.id, { onDelete: 'set null' }),
  cover: text("cover"),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const courseRelations = relations(course, ({ one, many }) => ({
  quizzes: many(quiz),
  category: one(category, { fields: [course.cateId], references: [category.id] }),
}))

export type InsertCourse = typeof course.$inferInsert
export type SelectCourse = typeof course.$inferSelect
