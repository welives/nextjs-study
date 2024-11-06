'use server'

import { revalidatePath } from 'next/cache'
import * as CourseService from '@/models/course-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { courseIdSchema, createCourseSchema, updateCourseSchema } from '../dto'
import type { CreateCourseData, UpdateCourseData } from '../dto'

/**
 * 获取全部课程
 */
export const getAllCourse = async () => {
  try {
    const res = await CourseService.getAll()
    return actionSuccess(res)
  } catch (error: any) {
    return actionFailure(error.message)
  }
}

/**
 * 添加课程
 * @param formData
 * @returns
 */
export async function createOne(formData: FormData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const data: CreateCourseData = {
      title: formData.get('title')!.toString(),
      cate_id: formData.get('cate_id')!.toString(),
      description: formData.get('description')?.toString(),
      cover: formData.get('cover')?.toString(),
    }

    const parsed = createCourseSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await CourseService.createOne(data)
    revalidatePath('/admin/course')
    return actionSuccess(void 0, '创建成功')
  } catch (error: any) {
    return actionFailure(error.message)
  }
}

/**
 * 修改课程
 * @param formData
 * @returns
 */
export async function updateOne(formData: FormData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const data: UpdateCourseData = {
      id: formData.get('id')!.toString(),
      title: formData.get('title')!.toString(),
      cate_id: formData.get('cate_id')!.toString(),
      description: formData.get('description')?.toString(),
      cover: formData.get('cover')?.toString(),
    }

    const parsed = updateCourseSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await CourseService.updateOne(data)
    revalidatePath('/admin/course')
    return actionSuccess(void 0, '修改成功')
  } catch (error: any) {
    return actionFailure(error.message)
  }
}

/**
 * 删除课程
 * @param id
 * @returns
 */
export async function deleteOne(id: string) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const parsed = courseIdSchema.safeParse(id)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await CourseService.deleteOne(id)
    revalidatePath('/admin/course')
    return actionSuccess(void 0, '删除成功')
  } catch (error: any) {
    return actionFailure(error.message)
  }
}
