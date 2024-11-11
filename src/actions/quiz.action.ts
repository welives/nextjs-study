'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import * as QuizService from '@/models/quiz.service'
import * as RecordService from '@/models/test-record.service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { quizIdSchema, createQuizSchema, updateQuizSchema, checkQuizAnswer } from '@/dto'
import type { CreateQuizData, UpdateQuizData, CheckQuizAnswer } from '@/dto'

/**
 * 根据课程id获取试题
 * @param id
 * @returns
 */
export const getByCourseId = cache(async (id: string, withCorrectAnswer = false) => {
  try {
    const data = await QuizService.findByCourseId(id, withCorrectAnswer)
    return actionSuccess(data)
  } catch (error: any) {
    return actionFailure(error.message)
  }
})

/**
 * 校验答题结果
 * @param data
 * @returns
 */
export async function checkTest(data: CheckQuizAnswer) {
  const session = await auth()
  try {
    const parsed = checkQuizAnswer.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }
    // 查出要校验答案的题目
    const quizzes = await QuizService.findByIds(data.quizzesData.map(e => e.id))
    // 对比答案
    const res = quizzes.map(quiz => {
      // 每一题的正确答案数组集合
      const correctOptions = quiz.answerOptions.filter(op => op.isCorrect).map(op => op.id)
      const answered = data.quizzesData.find(d => d.id === quiz.id)?.answered
      let result = false
      if (answered) {
        // 用户提交的答案每一项都在正确答案当中时
        result = answered.length === correctOptions.length && answered.every(op => correctOptions.includes(op[0]))
      }
      return { id: quiz.id, correctOptions, result }
    })

    if (session?.user) {
      const ratio: [number, number] = [res.filter(e => e.result).length, res.map(e => e.id).length]
      await RecordService.createOne(data, ratio, session.user.id!)
    }

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
export const getOne = cache(async (id: string) => {
  try {
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
})

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
