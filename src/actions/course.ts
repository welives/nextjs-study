'use server'

import { cache } from 'react'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import db from '@/db/drizzle'
import * as CourseService from '@/db/course-service'
import { isAdmin } from '@/lib/api'

export const getAll = cache(async () => {
  const res = await db.query.course.findMany({
    columns: {
      id: true,
      title: true,
    }
  })

  return res
})

export const createOne = async (data: CourseService.ICreateOrUpdate) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await CourseService.createOne(data)
  revalidatePath('/admin/course')
  /**
   * server action 返回给客户端组件的数据只能是简单的原始类型或简单的对象
   */
  return res
}

export const updateOne = async (data: CourseService.ICreateOrUpdate) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await CourseService.updateOne(data)
  revalidatePath('/admin/course')
  return res
}

export const deleteOne = async (id: string) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await CourseService.deleteOne(id)
  revalidatePath('/admin/course')
  return res
}
