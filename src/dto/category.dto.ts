import { z } from 'zod'
import { requiredMessage } from '@/constants'

export const categoryIdSchema = z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('分类ID') })

export const createCategorySchema = z.object({
  name: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('分类名称') }),
  pid: z.optional(z.string({ message: '不是一个字符串' }).nullable()),
  remark: z.optional(z.string({ message: '不是一个字符串' }).nullable())
})
export type CreateCategoryData = z.infer<typeof createCategorySchema>

export const updateCategorySchema = createCategorySchema.extend({ id: categoryIdSchema })
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>
