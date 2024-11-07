import { courseTable, courseRelations } from '../../schemas/course'
import { quizTable, quizRelations } from '../../schemas/quiz'
import { answerOptionsTable, answerOptionsRelations } from '../../schemas/answer-options'
import { categoryTable, categoryRelations } from '../../schemas/category'
import { userTable } from '../../schemas/user'

export * from '../../schemas/course'
export * from '../../schemas/quiz'
export * from '../../schemas/answer-options'
export * from '../../schemas/category'
export * from '../../schemas/user'

export const schemas = {
  course: courseTable,
  courseRelations,
  quiz: quizTable,
  quizRelations,
  answerOptions: answerOptionsTable,
  answerOptionsRelations,
  category: categoryTable,
  categoryRelations,
  user: userTable
}

export type SchemaType = typeof schemas
