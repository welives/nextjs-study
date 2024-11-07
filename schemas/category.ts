import { pgTable, text, timestamp, varchar, AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { courseTable } from './course'

/** 分类表 */

export const categoryTable = pgTable('categories', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  name: varchar('name', { length: 100 }).notNull(),
  pid: varchar('p_id').references((): AnyPgColumn => categoryTable.id, { onDelete: 'cascade' }),
  remark: text('remark'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const categoryRelations = relations(categoryTable, ({ one, many }) => ({
  courses: many(courseTable),
  children: many(categoryTable),
  parent: one(categoryTable, { fields: [categoryTable.pid], references: [categoryTable.id] }),
}))
