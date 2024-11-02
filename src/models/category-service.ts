import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'

import { category } from '../lib/schema'
import db from '../lib/drizzle'
import { ListPageData, CreateCategoryData, UpdateCategoryData } from '../dto'

/**
 * 分页列表
 */
export const getList = cache(async ({ keyword, page = 1, limit = 20 }: ListPageData) => {
  let res = await db.query.category.findMany({
    with: {
      parent: {
        columns: {
          id: true,
          name: true,
          pid: true
        }
      }
    }
  })
  if (keyword) {
    res = matchSorter(res, keyword, { keys: ['name'] })
  }
  // Pagination logic
  const offset = (page - 1) * limit
  const categories = res.slice(offset, offset + limit)

  return categories
})

/**
 * 添加分类
 */
export const createOne = cache(async ({ name, ...rest }: CreateCategoryData) => {
  const [entity] = await db.insert(category).values({ name, pid: rest.pid, remark: rest.remark }).returning({ insertId: category.id })
  if (!entity) {
    throw new Error('创建失败')
  }
  return !!entity
})

/**
 * 更新分类
 */
export const updateOne = cache(async ({ id, ...rest }: UpdateCategoryData) => {
  const [entity] = await db.update(category).set(rest).where(eq(category.id, id)).returning({ updateId: category.id })
  if (!entity) {
    throw new Error('修改失败')
  }
  return !!entity
})

/**
 * 删除分类
 * @param id
 * @returns
 */
export const deleteOne = cache(async (id: string) => {
  const [entity] = await db.delete(category).where(eq(category.id, id)).returning({ deleteId: category.id })
  if (!entity) {
    throw new Error('删除失败')
  }
  return id === entity.deleteId
})