import { cache } from 'react'
import { eq, and } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'
import { category } from './schema'
import db from './drizzle'

export interface IGetList {
  page?: number
  limit?: number
  keyword?: string | null
}

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: IGetList) => {
  let res = await db.query.category.findMany({
    columns: {
      id: true,
      name: true,
      pid: true,
      remark: true,
    },
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

export interface ICreateOrUpdate {
  id?: string
  name: string
  pid?: string | null
  remark?: string | null
}

/**
 * 添加分类
 */
export const createOne = cache(async ({ name, ...rest }: ICreateOrUpdate) => {
  // @ts-expect-error
  const res = await db.insert(category).values({ name, pid: rest.pid, remark: rest.remark }).returning({ insertId: category.id })

  return !!res
})

/**
 * 更新分类
 */
export const updateOne = cache(async ({ id, ...rest }: ICreateOrUpdate) => {
  const res = await db.update(category).set(rest).where(eq(category.id, id))
  return !!res
})

/**
 * 删除分类
 * @param id
 * @returns
 */
export const deleteOne = cache(async (id: string) => {
  const res = await db.delete(category).where(eq(category.id, id)).returning({ deleteId: category.id })
  return id === res[0].deleteId
})
