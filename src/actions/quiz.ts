'use server'

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import * as QuizService from '@/db/quiz-service'
import { isAdmin } from '@/lib/api'

export const createOne = async (data: QuizService.ICreateOrUpdate) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await QuizService.createOne(data)
  revalidatePath('/admin/quiz')
  /**
   * server action 返回给客户端组件的数据只能是简单的原始类型或简单的对象
   */
  return res
}

export const updateOne = async (data: QuizService.ICreateOrUpdate) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await QuizService.updateOne(data)
  revalidatePath('/admin/quiz')
  return res
}

export const deleteOne = async (id: string) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await QuizService.deleteOne(id)
  revalidatePath('/admin/quiz')
  return res
}
