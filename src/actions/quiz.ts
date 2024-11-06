'use server'

import { revalidatePath } from 'next/cache'
import * as QuizService from '@/models/quiz-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { quizIdSchema, createQuizSchema, updateQuizSchema, checkQuizAnswer } from '../dto'
import type { CreateQuizData, UpdateQuizData, CheckQuizAnswer } from '@/dto'

/**
 * 根据课程id获取试题
 * @param id
 * @returns
 */
export async function getListForTest(id: string, withCorrectAnswer = false) {
  try {
    const data = await QuizService.findByCourseId(id, withCorrectAnswer)
    return actionSuccess(data)
  } catch (error: any) {
    return actionFailure(error.message)
  }
}

export async function checkTest(data: CheckQuizAnswer) {
  try {
    const parsed = checkQuizAnswer.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }
    // 查出要校验答案的题目
    const quizzes = await QuizService.findByIds(data.map(e => e.id))
    // 对比答案
    const res = quizzes.map(e => {
      const correctOptions = e.answerOptions.filter(c => c.isCorrect)
      const answered = data.find(d => d.id === e.id)?.answered
      return {
        id: e.id,
        correctOptions: correctOptions.map(op => op.id),
        result: answered ? correctOptions.every(c => answered.includes(c.id)) : false
      }
    })
    return actionSuccess(res)
  } catch (error: any) {
    return actionFailure(error.message)
  }
}

/**
 * 获取单个试题详情
 * @param id
 * @returns
 */
export async function getOne(id: string) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const parsed = quizIdSchema.safeParse(id)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    const data = await QuizService.getOne(id)
    return actionSuccess(data)
  } catch (error: any) {
    return actionFailure(error.message)
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
    return actionSuccess(void 0, '创建成功')
  } catch (error: any) {
    return actionFailure(error.message)
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
    return actionSuccess(void 0, '修改成功')
  } catch (error: any) {
    return actionFailure(error.message)
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
    return actionSuccess(void 0, '删除成功')
  } catch (error: any) {
    return actionFailure(error.message)
  }
}
