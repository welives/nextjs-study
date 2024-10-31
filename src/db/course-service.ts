import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'
import { course } from './schema'
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
  let res = await db.query.course.findMany({
    with: {
      category: {
        columns: {
          id: true,
          name: true
        }
      }
    },
  })
  if (keyword) {
    res = matchSorter(res, keyword, { keys: ['title', 'description'] })
  }
  // Pagination logic
  const offset = (page - 1) * limit
  const courses = res.slice(offset, offset + limit)

  return courses
})

export interface ICreateOrUpdate {
  id?: string
  title: string
  cate_id: string
  description?: string | null
  cover?: string | null
}

/**
 * 添加课程
 */
export const createOne = cache(async ({ title, ...rest }: ICreateOrUpdate) => {
  // @ts-expect-error
  const [entity] = await db.insert(course).values({ title, cateId: rest.cate_id, description: rest.description, cover: rest.cover }).returning({ insertId: course.id })

  return !!entity
})

/**
 * 更新课程
 */
export const updateOne = cache(async ({ id, cate_id, ...rest }: ICreateOrUpdate) => {
  const [entity] = await db.update(course).set({ ...rest, cateId: cate_id }).where(eq(course.id, id)).returning({ updateId: course.id })
  return !!entity
})

/**
 * 删除课程
 * @param id
 * @returns
 */
export const deleteOne = cache(async (id: string) => {
  const [entity] = await db.delete(course).where(eq(course.id, id)).returning({ deleteId: course.id })
  return id === entity.deleteId
})
