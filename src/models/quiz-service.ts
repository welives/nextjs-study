import { cache } from 'react'
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
      quizAnswerOptions: {
        columns: {
          id: true,
          title: true,
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

  return quizzes
})

/**
 * 添加试题和答案选项
 */
export const createOne = cache(async ({ title, type, course_id, ...rest }: CreateQuizData) => {
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.insert(quiz).values({ title, type, courseId: course_id }).returning({ insertId: quiz.id })
      if (!quizEntity) {
        throw new Error()
      }

      const answerOptions = await Promise.all(rest.answer_options.map(async (el) => {
        const [entity] = await tx.insert(quizAnswerOption).values({ title: el.content, isCorrect: el.is_correct, quizId: quizEntity.insertId }).returning({ insertId: quizAnswerOption.id })
        return entity.insertId
      }))
      if (answerOptions.length === 0) {
        throw new Error()
      }

      return !!quizEntity && !!answerOptions
    } catch (error) {
      tx.rollback()
      throw new Error('试题添加失败')
    }
  })
})

/**
 * 更新试题和答案选项
 */
export const updateOne = cache(async ({ id, title, type, course_id, ...rest }: UpdateQuizData) => {
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.update(quiz).set({ title, type, courseId: course_id }).where(eq(quiz.id, id)).returning({ updateId: quiz.id })
      if (!quizEntity) {
        throw new Error()
      }

      const answerOptions = await Promise.all(
        rest.answer_options.map(async (el) => {
          const [entity] = await tx.update(quizAnswerOption).set({ title: el.content, isCorrect: el.is_correct }).where(eq(quizAnswerOption, el.id)).returning({ updateId: quizAnswerOption.id })
          return entity.updateId
        })
      )
      if (answerOptions.length === 0) {
        throw new Error()
      }

      return !!quizEntity && !!answerOptions
    } catch (error) {
      throw new Error('试题修改失败')
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
    throw new Error('删除失败')
  }
  return id === entity.deleteId
})
