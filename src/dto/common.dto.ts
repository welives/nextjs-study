import { z } from 'zod'

export const listPageSchema = z.object({
  limit: z.optional(z.coerce.number({ message: '不是一个数字' })),
  page: z.optional(z.coerce.number({ message: '不是一个数字' })),
  keyword: z.optional(z.string({ message: '不是一个字符串' }).nullable())
})

export type ListPageData = z.infer<typeof listPageSchema>
