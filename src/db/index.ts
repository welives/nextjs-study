import { course, courseRelations } from './schemas/course'
import { quiz, quizRelations } from './schemas/quiz'
import { quizAnswerOption, quizAnswerOptionRelations } from './schemas/quiz-answer-option'
import { category, categoryRelations } from './schemas/category'
import { user } from './schemas/user'

export * from './schemas/course'
export * from './schemas/quiz'
export * from './schemas/quiz-answer-option'
export * from './schemas/user'

export const schemas = {
  course,
  courseRelations,
  quiz,
  quizRelations,
  quizAnswerOption,
  quizAnswerOptionRelations,
  category,
  categoryRelations,
  user
}

export type SchemaType = typeof schemas
