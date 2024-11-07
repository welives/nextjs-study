import { cache } from 'react'
import { eq, inArray } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'

import { quizTable, answerOptionsTable } from '@/lib/schema'
import db from '@/lib/drizzle'
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


export const findByCourseId = cache(async (id: string, withCorrectAnswer = false) => {
  const res = await db.query.quiz.findMany({
    where: eq(quizTable.courseId, id),
    with: {
      answerOptions: {
        columns: {
          id: true,
          content: true,
          isCorrect: withCorrectAnswer
        }
      }
    }
  })

  return res
})

export const findByIds = cache(async (ids: string[]) => {
  const res = await db.query.quiz.findMany({
    where: inArray(quizTable.id, ids),
    with: {
      answerOptions: {
        columns: {
          id: true,
          content: true,
          isCorrect: true
        }
      }
    }
  })
  return res
})

/**
 * 试题详情
 */
export const getOne = cache(async (id: string) => {
  try {
    const res = await db.query.quiz.findFirst({
      where: eq(quizTable.id, id),
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

    return res
  } catch (error: any) {
    throw new Error(error.message)
  }
})

/**
 * 添加试题和答案选项
 */
export const createOne = async ({ title, type, course_id, chapter, remark, ...rest }: CreateQuizData) => {
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.insert(quizTable).values({ title, type, chapter, remark, courseId: course_id }).returning({ insertId: quizTable.id })
      if (!quizEntity) throw new Error('试题添加失败')

      const answerOptions = await Promise.all(rest.options.map(async (el) => {
        const [entity] = await tx.insert(answerOptionsTable).values({ content: el.content, isCorrect: el.is_correct, quizId: quizEntity.insertId }).returning({ insertId: answerOptionsTable.id })
        return entity.insertId
      }))
      if (answerOptions.length === 0) throw new Error('试题添加失败')
    } catch (error: any) {
      tx.rollback()
      throw new Error(error.message)
    }
  })
}

/**
 * 更新试题和答案选项
 */
export const updateOne = async ({ id, title, type, course_id, chapter, remark, ...rest }: UpdateQuizData) => {
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.update(quizTable).set({ title, type, chapter, remark, courseId: course_id }).where(eq(quizTable.id, id)).returning({ updateId: quizTable.id })
      if (!quizEntity) throw new Error('试题修改失败')

      if (rest.options?.length) {
        const answerOptions = await Promise.all(
          rest.options.map(async (el) => {
            const [entity] = await tx.update(answerOptionsTable).set({ content: el.content, isCorrect: el.is_correct }).where(eq(answerOptionsTable.id, el.id)).returning({ updateId: answerOptionsTable.id })
            return entity.updateId
          })
        )
        if (answerOptions.length === 0) throw new Error('试题修改失败')
      }
    } catch (error: any) {
      tx.rollback()
      throw new Error(error.message)
    }
  })
}

/**
 * 删除试题
 * @param id
 * @returns
 */
export const deleteOne = async (id: string) => {
  const [entity] = await db.delete(quizTable).where(eq(quizTable.id, id)).returning({ deleteId: quizTable.id })
  if (!entity) throw new Error('删除失败')
  return id === entity.deleteId
}
