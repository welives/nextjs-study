import { pgTable, timestamp, varchar, json, customType } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { userTable } from './user'

type AnsweredData = [string, number]

// 自定义字段类型
const answeredIdsJson = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return 'json'
    },
    toDriver(value: TData): string {
      return JSON.stringify(value)
    },
  })(name)


/** 测试记录表 */

export const testRecordTable = pgTable('test_records', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  userId: varchar('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 100 }).notNull(),
  quizIds: varchar('quiz_ids').array().notNull(),
  answerOptionsIds: varchar('answer_options_ids').array().array().notNull(),
  answeredIds: answeredIdsJson<Record<string, number>[]>('answered_ids').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const testRecordRelations = relations(testRecordTable, ({ one }) => ({
  user: one(userTable, { fields: [testRecordTable.userId], references: [userTable.id] }),
}))
