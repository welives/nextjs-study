import { courseTable, courseRelations } from '../../schemas/course'
import { quizTable, quizRelations } from '../../schemas/quiz'
import { answerOptionTable, answerOptionRelations } from '../../schemas/answer-option'
import { testRecordTable, testRecordRelations } from '../../schemas/test-record'
import { categoryTable, categoryRelations } from '../../schemas/category'
import { userTable, userRelations } from '../../schemas/user'

export * from '../../schemas/course'
export * from '../../schemas/quiz'
export * from '../../schemas/answer-option'
export * from '../../schemas/test-record'
export * from '../../schemas/category'
export * from '../../schemas/user'

export const schemas = {
  course: courseTable,
  courseRelations,
  quiz: quizTable,
  quizRelations,
  answerOption: answerOptionTable,
  answerOptionRelations,
  testRecord: testRecordTable,
  testRecordRelations,
  category: categoryTable,
  categoryRelations,
  user: userTable,
  userRelations
}

export type SchemaType = typeof schemas
