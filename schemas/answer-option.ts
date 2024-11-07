import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { quizTable } from './quiz'

/** 测试答案选项表 */

export const answerOptionTable = pgTable('answer_options', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  content: text('content').notNull(),
  quizId: varchar('quiz_id')
    .notNull()
    .references(() => quizTable.id, { onDelete: 'cascade' }),
  isCorrect: boolean('is_correct').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const answerOptionRelations = relations(answerOptionTable, ({ one }) => ({
  quiz: one(quizTable, { fields: [answerOptionTable.quizId], references: [quizTable.id] }),
}))
