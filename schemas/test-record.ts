import { pgTable, timestamp, varchar, json, customType } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { userTable } from './user'

// 第一项是用户的答案id, 第二项是当时候选答案中所处的顺序
export type TupleAnswered = [string, number]

// 自定义元祖类型字段
const customJson = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return 'json'
    },
    toDriver(value: TData): string {
      return JSON.stringify(value)
    },
  })(name)

/** 答题记录表 */

export const testRecordTable = pgTable('test_records', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  userId: varchar('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 100 }).notNull(),
  quizIds: varchar('quiz_ids').array().notNull(),
  answerOptionsIds: varchar('answer_options_ids').array().array().notNull(),
  answeredIds: customJson<TupleAnswered[]>('answered_ids').array().default([]),
  correctRatio: json('correct_ratio').$type<[number, number]>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const testRecordRelations = relations(testRecordTable, ({ one }) => ({
  user: one(userTable, { fields: [testRecordTable.userId], references: [userTable.id] }),
}))
