'use server'

import { revalidatePath } from 'next/cache'
import * as QuizService from '@/models/quiz-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { quizIdSchema, createQuizSchema, updateQuizSchema, CreateQuizData, UpdateQuizData } from '../dto'

export async function getOne(id: string) {
  try {
    const data = await QuizService.getOne(id)
    return actionSuccess({ data })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}

/**
 * 添加试题
 * @param data
 * @returns
 */
export async function createOne(data: CreateQuizData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const parsed = createQuizSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await QuizService.createOne(data)
    revalidatePath('/admin/quiz')
    revalidatePath('/admin/quiz/new')
    return actionSuccess({ msg: '创建成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}

/**
 * 修改试题
 * @param data
 * @returns
 */
export async function updateOne(data: UpdateQuizData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const parsed = updateQuizSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }
    await QuizService.updateOne(data)
    revalidatePath('/admin/quiz')
    return actionSuccess({ msg: '修改成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}

/**
 * 删除试题
 * @param id
 * @returns
 */
export async function deleteOne(id: string) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const parsed = quizIdSchema.safeParse(id)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await QuizService.deleteOne(id)
    revalidatePath('/admin/quiz')
    return actionSuccess({ msg: '删除成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}
