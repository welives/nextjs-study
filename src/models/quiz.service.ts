import { cache } from 'react'
import { eq, like, inArray } from 'drizzle-orm'

import { quizTable, answerOptionTable } from '@/lib/schema'
import { getConnection } from '@/lib/drizzle'
import { ListPageData, CreateQuizData, UpdateQuizData } from '@/dto'

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: ListPageData) => {
  const db = await getConnection()
  const res = await db.query.quiz.findMany({
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
    ...(keyword ? { where: like(quizTable.title, `%${keyword}%`) } : void 0),
    limit,
    offset: (page - 1) * limit
  })
  const count = await db.$count(quizTable, keyword ? like(quizTable.title, `%${keyword}%`) : void 0)

  return {
    rows: res,
    count
  }

  // if (keyword) {
  //   res = matchSorter(res, keyword, { keys: ['title'] })
  // }
  // // Pagination logic
  // const offset = (page - 1) * limit
  // const quizzes = res.slice(offset, offset + limit)
  // const count = res.length
})

/**
 * 根据课程id查找试题
 * @param id
 * @param withCorrectAnswer
 * @returns
 */
export async function findByCourseId(id: string, withCorrectAnswer = false) {
  const db = await getConnection()
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
}

/**
 * 根据试题集合进行查找
 */
export const findByIds = cache(async (ids: string[]) => {
  const db = await getConnection()
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
export async function getOne(id: string) {
  const db = await getConnection()
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
}

/**
 * 添加试题和答案选项
 */
export async function createOne({ title, type, course_id, chapter, remark, ...rest }: CreateQuizData) {
  const db = await getConnection()
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.insert(quizTable).values({ title, type, chapter: chapter ?? '', remark, courseId: course_id }).returning({ insertId: quizTable.id })
      if (!quizEntity) throw new Error('试题添加失败')

      const answerOptions = await Promise.all(rest.options.map(async (el) => {
        const [entity] = await tx.insert(answerOptionTable).values({ content: el.content, isCorrect: el.is_correct, quizId: quizEntity.insertId }).returning({ insertId: answerOptionTable.id })
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
export async function updateOne({ id, title, type, course_id, chapter, remark, ...rest }: UpdateQuizData) {
  const db = await getConnection()
  await db.transaction(async (tx) => {
    try {
      const [quizEntity] = await tx.update(quizTable).set({ title, type, chapter: chapter ?? '', remark, courseId: course_id }).where(eq(quizTable.id, id)).returning({ updateId: quizTable.id })
      if (!quizEntity) throw new Error('试题修改失败')

      if (rest.options?.length) {
        const answerOptions = await Promise.all(
          rest.options.map(async (el) => {
            const [entity] = await tx.update(answerOptionTable).set({ content: el.content, isCorrect: el.is_correct }).where(eq(answerOptionTable.id, el.id)).returning({ updateId: answerOptionTable.id })
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
export async function deleteOne(id: string) {
  const db = await getConnection()
  const [entity] = await db.delete(quizTable).where(eq(quizTable.id, id)).returning({ deleteId: quizTable.id })
  if (!entity) throw new Error('删除失败')
  return id === entity.deleteId
}
