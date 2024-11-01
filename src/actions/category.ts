'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import db from '@/db/drizzle'
import * as CategoryService from '@/db/category-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { findChildren, formatZodErrorMsg } from '@/lib/utils'
import { categoryIdSchema, createCategorySchema, updateCategorySchema, CreateCategoryData, UpdateCategoryData } from '../dto'

/**
 * 获取全部分类
 */
export const getAll = cache(async () => {
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
})

/**
 * 添加分类
 * @param formData
 * @returns
 */
export async function createOne(formData: FormData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const data: CreateCategoryData = {
      name: formData.get('name')!.toString(),
      pid: formData.get('pid')?.toString(),
      remark: formData.get('remark')?.toString()
    }

    const parsed = createCategorySchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await CategoryService.createOne(data)
    revalidatePath('/admin/category')
    return actionSuccess({ msg: '创建成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}

/**
 * 修改分类
 * @param formData
 * @returns
 */
export async function updateOne(formData: FormData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const data: UpdateCategoryData = {
      id: formData.get('id')!.toString(),
      name: formData.get('name')!.toString(),
      pid: formData.get('pid')?.toString(),
      remark: formData.get('remark')?.toString()
    }

    const parsed = updateCategorySchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await CategoryService.updateOne(data)
    revalidatePath('/admin/category')
    return actionSuccess({ msg: '修改成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}

/**
 * 删除分类
 * @param id
 * @returns
 */
export async function deleteOne(id: string) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const parsed = categoryIdSchema.safeParse(id)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await CategoryService.deleteOne(id)
    revalidatePath('/admin/category')
    return actionSuccess({ msg: '删除成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}
