import { cache } from 'react'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'

import { quiz, quizAnswerOption } from '../lib/schema'
import db from '../lib/drizzle'
import { ListPageData, CreateQuizData, UpdateQuizData } from '../dto'

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: ListPageData) => {
  let res = await db.query.quiz.findMany({
    with: {
      course: {
        columns: {
          id: true,
          title: true
        }
      },
      answerOptions: {
        columns: {
          id: true,
          content: true,
          isCorrect: true
        }
      }
    },
  })
  if (keyword) {
    res = matchSorter(res, keyword, { keys: ['title'] })
  }
  // Pagination logic
  const offset = (page - 1) * limit
  const quizzes = res.slice(offset, offset + limit)
  const count = res.length

  return {
    rows: quizzes,
    count
  }
})

/**
 * 试题详情
 */
export const getOne = cache(async (id: string) => {
  try {
    const res = await db.query.quiz.findFirst({
      where: eq(quiz.id, id),
      with: {
        answerOptions: {
          columns: {
            id: true,
            content: true,
            isCorrect: true
          }
        },
        course: {
          columns: {
            id: true,
            title: true
          }
        }
      }
    })
    if (!res) {
      notFound()
    }
    return res
  } catch (error: any) {
    throw new Error(error.message)
  }
})

/**
 * 添加试题和答案选项
 */
export const createOne = cache(async ({ title, type, course_id, chapter, remark, ...rest }: CreateQuizData) => {
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.insert(quiz).values({ title, type, chapter, remark, courseId: course_id }).returning({ insertId: quiz.id })
      if (!quizEntity) throw new Error('试题添加失败')

      const answerOptions = await Promise.all(rest.options.map(async (el) => {
        const [entity] = await tx.insert(quizAnswerOption).values({ content: el.content, isCorrect: el.is_correct, quizId: quizEntity.insertId }).returning({ insertId: quizAnswerOption.id })
        return entity.insertId
      }))
      if (answerOptions.length === 0) {
        throw new Error('试题添加失败')
      }
    } catch (error: any) {
      tx.rollback()
      throw new Error(error.message)
    }
  })
})

/**
 * 更新试题和答案选项
 */
export const updateOne = cache(async ({ id, title, type, course_id, chapter, remark, ...rest }: UpdateQuizData) => {
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.update(quiz).set({ title, type, chapter, remark, courseId: course_id }).where(eq(quiz.id, id)).returning({ updateId: quiz.id })
      if (!quizEntity) {
        notFound()
      }

      if (rest.options?.length) {
        const answerOptions = await Promise.all(
          rest.options.map(async (el) => {
            const [entity] = await tx.update(quizAnswerOption).set({ content: el.content, isCorrect: el.is_correct }).where(eq(quizAnswerOption.id, el.id)).returning({ updateId: quizAnswerOption.id })
            return entity.updateId
          })
        )
        if (answerOptions.length === 0) {
          throw new Error('试题修改失败')
        }
      }
    } catch (error: any) {
      tx.rollback()
      throw new Error(error.message)
    }
  })
})

/**
 * 删除试题
 * @param id
 * @returns
 */
export const deleteOne = cache(async (id: string) => {
  const [entity] = await db.delete(quiz).where(eq(quiz.id, id)).returning({ deleteId: quiz.id })
  if (!entity) {
    notFound()
  }
  return id === entity.deleteId
})
