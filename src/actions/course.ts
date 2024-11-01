'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import db from '@/db/drizzle'
import * as CourseService from '@/db/course-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { courseIdSchema, createCourseSchema, updateCourseSchema, CreateCourseData, UpdateCourseData } from '../dto'

/**
 * 获取全部课程
 */
export const getAll = cache(async () => {
  const res = await db.query.course.findMany({
    columns: {
      id: true,
      title: true,
    }
  })

  return res
})

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
    return actionSuccess({ msg: '创建成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
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
    return actionSuccess({ msg: '修改成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
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
    return actionSuccess({ msg: '删除成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}
