import { cache } from 'react'
import { eq, and } from 'drizzle-orm'

import { category } from './schema'
import db from './drizzle'

export const getCategories = cache(async ({ page = 1, pageSize = 20, keyword = void 0, isPaginate = true } = {}) => {
  if (isPaginate) {
    return await db.query.category.findMany({
      where: eq(category.name, keyword),
      limit: pageSize,
      offset: page
    })
  }
  return await db.query.category.findMany({
    where: eq(category.name, keyword),
  })
})
