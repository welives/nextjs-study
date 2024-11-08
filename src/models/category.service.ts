import { cache } from 'react'
import { eq, like } from 'drizzle-orm'

import { findChildren } from '@/lib/utils'
import { categoryTable } from '@/lib/schema'
import db from '@/lib/drizzle'
import { ListPageData, CreateCategoryData, UpdateCategoryData } from '@/dto'

/**
 * 获取全部分类
 */
export async function getAll() {
  const res = await db.query.category.findMany({
    columns: {
      id: true,
      name: true,
      pid: true
    }
  })

  const data = res.map((e) => {
    const children = findChildren<string>(res, [e.id])
    return { ...e, childIds: children }
  })

  return data
}

/**
 * 分页列表
 */
export const getList = cache(async ({ keyword, page = 1, limit = 20 }: ListPageData) => {
  const res = await db.query.category.findMany({
    with: {
      parent: {
        columns: {
          id: true,
          name: true,
          pid: true
        }
      }
    },
    ...(keyword ? { where: like(categoryTable.name, `%${keyword}%`) } : void 0),
    limit,
    offset: (page - 1) * limit
  })
  const count = await db.$count(categoryTable, keyword ? like(categoryTable.name, `%${keyword}%`) : void 0)

  return {
    rows: res,
    count
  }
})

/**
 * 添加分类
 */
export async function createOne({ name, ...rest }: CreateCategoryData) {
  const [entity] = await db.insert(categoryTable).values({ name, pid: rest.pid, remark: rest.remark }).returning({ insertId: categoryTable.id })
  if (!entity) throw new Error('创建失败')

  return entity
}

/**
 * 更新分类
 */
export async function updateOne({ id, ...rest }: UpdateCategoryData) {
  const [entity] = await db.update(categoryTable).set(rest).where(eq(categoryTable.id, id)).returning({ updateId: categoryTable.id })
  if (!entity) throw new Error('修改失败')

  return entity
}

/**
 * 删除分类
 * @param id
 * @returns
 */
export async function deleteOne(id: string) {
  const [entity] = await db.delete(categoryTable).where(eq(categoryTable.id, id)).returning({ deleteId: categoryTable.id })
  if (!entity) throw new Error('删除失败')

  return id === entity.deleteId
}
