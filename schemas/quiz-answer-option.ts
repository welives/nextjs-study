import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { quiz } from './quiz'

/** 测试答案选项表 */

export const quizAnswerOption = pgTable('quiz_answer_options', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  title: text('title').notNull(),
  quizId: varchar('quiz_id')
    .notNull()
    .references(() => quiz.id),
  isCorrect: boolean('is_correct').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const quizAnswerOptionRelations = relations(quizAnswerOption, ({ one }) => ({
  quiz: one(quiz, { fields: [quizAnswerOption.quizId], references: [quiz.id] }),
}))

export type InsertQuizAnswerOption = typeof quizAnswerOption.$inferInsert
export type SelectQuizAnswerOption = typeof quizAnswerOption.$inferSelect
