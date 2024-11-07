import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { matchSorter } from 'match-sorter'
import { testRecordTable } from '@/lib/schema'
import db from '@/lib/drizzle'
import { ListPageData, CheckQuizAnswer } from '../dto'

/**
 * 分页列表
 */
export const getList = cache(async ({ page = 1, limit = 20, keyword = void 0 }: ListPageData) => {
  let res = await db.query.testRecord.findMany()
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
 * 获取测试记录
 * @param id
 * @returns
 */
export const getOne = cache(async (id: string) => {
  const res = await db.query.testRecord.findFirst({ where: eq(testRecordTable.id, id) })
  return res
})

/**
 * 创建记录
 * @param data
 */
export async function createOne(data: CheckQuizAnswer, userId: string) {
  const quizIds = data.quizzesData.map(el => el.id)
  const answerOptionsIds = data.quizzesData.map(el => el.options)
  const answeredIds = data.quizzesData.map(el => el.answered ?? [])
  const [entity] = await db.insert(testRecordTable).values({ userId, title: data.title, quizIds, answerOptionsIds, answeredIds }).returning({ insertId: testRecordTable.id })
  if (!entity) throw new Error('测试记录创建失败')
}
