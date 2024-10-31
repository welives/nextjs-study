import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'
import { quiz, quizAnswerOption, QuizType } from './schema'
import db from './drizzle'

export interface IGetList {
  page?: number
  limit?: number
  keyword?: string | null
}

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: IGetList) => {
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

export interface ICreateOrUpdate {
  id?: string
  title: string
  type: QuizType
  course_id: string
  answer_options: { id?: string, title: string, isCorrect: boolean }[]
}

/**
 * 添加试题和答案选项
 */
export const createOne = cache(async ({ title, type, course_id, ...rest }: ICreateOrUpdate) => {
  const res = await db.transaction(async (tx) => {
    try {
      const [entity] = await tx.insert(quiz).values({ title, type, courseId: course_id }).returning({ insertId: quiz.id })

      const answerOptions = await Promise.all(rest.answer_options.map(async (el) => {
        // @ts-expect-error
        const [entity] = await tx.insert(quizAnswerOption).values({ title: el.title, isCorrect: el.isCorrect }).returning({ insertId: quizAnswerOption.id })
        return entity.insertId
      }))
      return !!entity && !!answerOptions
    } catch (error) {
      throw new Error('试题添加失败')
    }
  })

  return res
})

/**
 * 更新试题和答案选项
 */
export const updateOne = cache(async ({ id, title, type, course_id, ...rest }: ICreateOrUpdate) => {
  await db.transaction(async (tx) => {
    try {
      const [entity] = await tx.update(quiz).set({ title, type, courseId: course_id }).where(eq(quiz.id, id)).returning({ updateId: quiz.id })

      const answerOptions = await Promise.all(
        rest.answer_options.map(async (el) => {
          // @ts-expect-error
          const [entity] = await tx.update(quizAnswerOption).set({ title: el.title, isCorrect: el.isCorrect }).where(eq(quizAnswerOption, el.id)).returning({ updateId: quizAnswerOption.id })
          return entity.updateId
        })
      )

      return !!entity && !!answerOptions
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
  return id === entity.deleteId
})
