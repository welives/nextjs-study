import { cache } from 'react'
import { eq, like, or } from 'drizzle-orm'

import { courseTable } from '@/lib/schema'
import db from '@/lib/drizzle'
import { ListPageData, CreateCourseData, UpdateCourseData } from '@/dto'

export async function getAll() {
  const res = await db.query.course.findMany({
    columns: {
      id: true,
      title: true,
    }
  })

  return res
}

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: ListPageData) => {
  console.log('keyword', keyword);
  const res = await db.query.course.findMany({
    with: {
      category: {
        columns: {
          id: true,
          name: true
        }
      }
    },
    ...(keyword ? { where: or(like(courseTable.title, `%${keyword}%`), like(courseTable.description, `%${keyword}%`)) } : void 0),
    limit,
    offset: (page - 1) * limit
  })
  const count = await db.$count(courseTable, keyword ? or(like(courseTable.title, `%${keyword}%`), like(courseTable.description, `%${keyword}%`)) : void 0)

  return {
    rows: res,
    count
  }
})

/**
 * 添加课程
 */
export async function createOne({ title, ...rest }: CreateCourseData) {
  const [entity] = await db.insert(courseTable).values({ title, cateId: rest.cate_id, description: rest.description, cover: rest.cover }).returning({ insertId: courseTable.id })
  if (!entity) throw new Error('创建失败')

  return entity
}

/**
 * 更新课程
 */
export async function updateOne({ id, cate_id, ...rest }: UpdateCourseData) {
  const [entity] = await db.update(courseTable).set({ ...rest, cateId: cate_id }).where(eq(courseTable.id, id)).returning({ updateId: courseTable.id })
  if (!entity) throw new Error('修改失败')

  return entity
}

/**
 * 删除课程
 * @param id
 * @returns
 */
export async function deleteOne(id: string) {
  const [entity] = await db.delete(courseTable).where(eq(courseTable.id, id)).returning({ deleteId: courseTable.id })
  if (!entity) throw new Error('删除失败')

  return id === entity.deleteId
}
