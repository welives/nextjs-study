import { z } from 'zod'

export const listPageSchema = z.object({
  limit: z.coerce.number({ message: '不是一个数字' }).optional(),
  page: z.coerce.number({ message: '不是一个数字' }).optional(),
  keyword: z.string({ message: '不是一个字符串' }).nullable().optional()
})

export type ListPageData = z.infer<typeof listPageSchema>
