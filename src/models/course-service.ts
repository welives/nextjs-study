import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'

import { course } from '../lib/schema'
import db from '../lib/drizzle'
import { ListPageData, CreateCourseData, UpdateCourseData } from '../dto'

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: ListPageData) => {
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
  const count = res.length

  return {
    rows: courses,
    count
  }
})

/**
 * 添加课程
 */
export const createOne = cache(async ({ title, ...rest }: CreateCourseData) => {
  const [entity] = await db.insert(course).values({ title, cateId: rest.cate_id, description: rest.description, cover: rest.cover }).returning({ insertId: course.id })
  if (!entity) {
    throw new Error('创建失败')
  }
  return !!entity
})

/**
 * 更新课程
 */
export const updateOne = cache(async ({ id, cate_id, ...rest }: UpdateCourseData) => {
  const [entity] = await db.update(course).set({ ...rest, cateId: cate_id }).where(eq(course.id, id)).returning({ updateId: course.id })
  if (!entity) {
    throw new Error('修改失败')
  }
  return !!entity
})

/**
 * 删除课程
 * @param id
 * @returns
 */
export const deleteOne = cache(async (id: string) => {
  const [entity] = await db.delete(course).where(eq(course.id, id)).returning({ deleteId: course.id })
  if (!entity) {
    throw new Error('删除失败')
  }
  return id === entity.deleteId
})
