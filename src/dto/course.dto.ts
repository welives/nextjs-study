import { z } from 'zod'
import { requiredMessage } from '@/constants'

export const courseIdSchema = z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('课程ID') })

export const createCourseSchema = z.object({
  title: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('课程名称') }),
  cate_id: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('分类ID') }),
  description: z.string({ message: '不是一个字符串' }).nullable().optional(),
  cover: z.string({ message: '不是一个字符串' }).nullable().optional()
})

export type CreateCourseData = z.infer<typeof createCourseSchema>

export const updateCourseSchema = createCourseSchema.extend({ id: courseIdSchema })
export type UpdateCourseData = z.infer<typeof updateCourseSchema>
