import { z } from 'zod'
import { requiredMessage } from '@/constants'
import { QuizType } from '@/lib/schema'

export const quizIdSchema = z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('试题ID') })

const baseQuizSchema = z.object({
  title: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('题目') }),
  course_id: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('课程ID') }),
  type: z.nativeEnum(QuizType, { message: '不是一个合法的枚举值' }),
})

const answerOptionsShcema = z.object({
  content: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('答案内容') }),
  is_correct: z.boolean({ message: '不是一个布尔值' })
})

export const createQuizSchema = baseQuizSchema.extend({ answer_options: z.array(answerOptionsShcema, { message: '不是一个合法的数组' }) })

export type CreateQuizData = z.infer<typeof createQuizSchema>

export const updateQuizSchema = baseQuizSchema.extend({
  id: quizIdSchema,
  answer_options: z.array(
    answerOptionsShcema.extend({ id: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('答案ID') }) }),
    { message: '不是一个合法的数组' }
  )
})
export type UpdateQuizData = z.infer<typeof updateQuizSchema>
