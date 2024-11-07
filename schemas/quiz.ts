import { pgTable, text, timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { answerOptionsTable } from './answer-options'
import { courseTable } from './course'

export enum QuizType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  JUDGEMENT = 'judgement'
}

export const quizTypeEnums = pgEnum('type', [
  QuizType.SINGLE,
  QuizType.MULTIPLE,
  QuizType.JUDGEMENT,
])

/** 测试题干表 */

export const quizTable = pgTable('quizzes', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  title: text('title').notNull(),
  courseId: varchar('course_id')
    .notNull()
    .references(() => courseTable.id, { onDelete: 'set null' }),
  type: quizTypeEnums('type').notNull(),
  chapter: varchar('chapter', { length: 30 }),
  remark: text("remark"),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const quizRelations = relations(quizTable, ({ many, one }) => ({
  answerOptions: many(answerOptionsTable),
  course: one(courseTable, { fields: [quizTable.courseId], references: [courseTable.id] }),
}))
