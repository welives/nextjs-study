import { z } from 'zod'
import { requiredMessage } from '@/constants'
import { QuizType } from '@/lib/schema'

export const quizIdSchema = z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('试题ID') })

const baseQuizSchema = z.object({
  title: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('题目') }),
  course_id: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('课程ID') }),
  type: z.nativeEnum(QuizType, { message: '不是一个合法的枚举值' }),
  chapter: z.string({ message: '不是一个字符串' }).nullable().optional(),
  remark: z.string({ message: '不是一个字符串' }).nullable().optional(),
})

const answerOptionsSchema = z.object({
  content: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('答案内容') }),
  is_correct: z.boolean({ message: '不是一个布尔值' })
})

export const createQuizSchema = baseQuizSchema.extend({ options: answerOptionsSchema.array().min(1, { message: '候选答案不能为空' }) })

export type CreateQuizData = z.infer<typeof createQuizSchema>

export const updateQuizSchema = baseQuizSchema.extend({
  id: quizIdSchema,
  options: answerOptionsSchema.extend({ id: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('答案ID') }) }).array().optional()
})
export type UpdateQuizData = z.infer<typeof updateQuizSchema>
