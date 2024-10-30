import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { category } from './category'
import { quizAnswerOption } from './quiz-answer-option'
import { course } from './course'

/** 测试题干表 */

export const quiz = pgTable('quizzes', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  title: text('title').notNull(),
  courseId: varchar('course_id')
    .notNull()
    .references(() => course.id, { onDelete: 'set null' }),
  cateId: varchar('cate_id')
    .notNull()
    .references(() => category.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const quizRelations = relations(quiz, ({ many, one }) => ({
  quizAnswerOptions: many(quizAnswerOption),
  category: one(category, { fields: [quiz.cateId], references: [category.id] }),
  course: one(course, { fields: [quiz.courseId], references: [course.id] }),
}))

export type InsertQuiz = typeof quiz.$inferInsert
export type SelectQuiz = typeof quiz.$inferSelect
