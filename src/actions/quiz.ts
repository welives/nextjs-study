'use server'

import { revalidatePath } from 'next/cache'
import * as QuizService from '@/models/quiz-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { quizIdSchema, createQuizSchema, updateQuizSchema, CreateQuizData, UpdateQuizData } from '../dto'

/**
 * 添加试题
 * @param formData
 * @returns
 */
export async function createOne(formData: FormData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const data: CreateQuizData = {
      title: formData.get('title')!.toString(),
      course_id: formData.get('course_id')!.toString(),
      type: formData.get('type') as CreateQuizData['type'],
      answer_options: formData.get('answer_options') as unknown as CreateQuizData['answer_options']
    }

    const parsed = createQuizSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    await QuizService.createOne(data)
    revalidatePath('/admin/quiz/create')
    return actionSuccess({ msg: '创建成功' })
  } catch (error: any) {
    return actionFailure({ msg: error.message })
  }
}

/**
 * 修改试题
 * @param formData
 * @returns
 */
export async function updateOne(formData: FormData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const data: UpdateQuizData = {
      id: formData.get('id')!.toString(),
      title: formData.get('title')!.toString(),
      course_id: formData.get('course_id')!.toString(),
      type: formData.get('type') as UpdateQuizData['type'],
      answer_options: formData.get('answer_options') as unknown as UpdateQuizData['answer_options']
    }

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
