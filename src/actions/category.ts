'use server'

import { revalidatePath } from 'next/cache'
import * as CategoryService from '@/models/category-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from '../dto'
import type { CreateCategoryData, UpdateCategoryData } from '../dto'

/**
 * 获取全部分类
 */
export const getAllCategory = async () => {
  try {
    const res = await CategoryService.getAll()
    return actionSuccess(res)
  } catch (error: any) {
    return actionFailure(error.message)
  }
}

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
    return actionSuccess(void 0, '创建成功')
  } catch (error: any) {
    return actionFailure(error.message)
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
    return actionSuccess(void 0, '修改成功')
  } catch (error: any) {
    return actionFailure(error.message)
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
    return actionSuccess(void 0, '删除成功')
  } catch (error: any) {
    return actionFailure(error.message)
  }
}
