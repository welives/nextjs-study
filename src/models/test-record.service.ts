import { cache } from 'react'
import { eq, like, inArray } from 'drizzle-orm'

import { quizTable, testRecordTable } from '@/lib/schema'
import db from '@/lib/drizzle'
import { ListPageData, CheckQuizAnswer } from '@/dto'

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: ListPageData) => {
  const res = await db.query.testRecord.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    ...(keyword ? { where: like(testRecordTable.title, `%${keyword}%`) } : void 0),
    limit,
    offset: (page - 1) * limit
  })
  const count = await db.$count(testRecordTable, keyword ? like(testRecordTable.title, `%${keyword}%`) : void 0)

  return {
    rows: res.map(e => ({ id: e.id, title: e.title, userId: e.userId, user: e.user, ratio: Math.floor(e.correctRatio[0] / e.correctRatio[1] * 100), createdAt: e.createdAt })),
    count
  }
})

/**
 * 获取答题记录
 * @param id
 * @returns
 */
export async function findById(id: string) {
  const record = await db.query.testRecord.findFirst({ where: eq(testRecordTable.id, id) })
  if (!record) throw new Error('答题记录不存在')

  const quizzes = await db.query.quiz.findMany({
    where: inArray(quizTable.id, record?.quizIds ?? []),
    with: {
      answerOptions: {
        columns: {
          id: true,
          content: true,
          isCorrect: true
        }
      }
    },
    columns: {
      id: true,
      title: true,
      type: true
    }
  })

  return {
    title: record.title,
    quizzes: record.quizIds.map((quizId, index) => {
      const idx = quizzes.findIndex(q => q.id === quizId)
      // 答题时的选项顺序
      const answerOptions = record.answerOptionsIds[index].map(optionId => {
        // 原题顺序
        const option = quizzes[idx].answerOptions.find(el => el.id === optionId)
        return { id: optionId, content: option?.content!, isCorrect: option?.isCorrect! }
      })
      // 答题时的提交答案
      const answeredIds = record.answeredIds?.[index].map(el => el[0]) ?? []
      return { id: quizId, title: quizzes[idx].title, type: quizzes[idx].type, answerOptions, answeredIds }
    })
  }
}

/**
 * 创建答题记录
 * @param data
 */
export async function createOne(data: CheckQuizAnswer, ratio: [number, number], userId: string) {
  const quizIds = data.quizzesData.map(el => el.id)
  const answerOptionsIds = data.quizzesData.map(el => el.options)
  const answeredIds = data.quizzesData.map(el => el.answered ?? [])
  const [entity] = await db.insert(testRecordTable).values({ userId, title: data.title, quizIds, answerOptionsIds, answeredIds, correctRatio: ratio }).returning({ insertId: testRecordTable.id })
  if (!entity) throw new Error('答题记录创建失败')
}
