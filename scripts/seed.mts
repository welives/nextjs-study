import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { schemas, QuizType } from '../src/lib/schema'

const { course: courseTable, quiz: quizTable, answerOption: answerOptionTable, category: categoryTable } = schemas

interface AnswerOptions {
  id: number
  title: string
  correct?: boolean
}

interface JsonData {
  subject: string
  category: string
  data: {
    id: number
    chapter: string
    title: string
    desc: string
    type: QuizType
    options: AnswerOptions[]
  }[]
}

const rootDir = path.resolve(process.cwd(), './')
const { parsed, error } = dotenv.config({ path: `${rootDir}/.env.local` })
if (error || [void 0, ''].indexOf(parsed!.DATABASE_DSN) !== -1) {
  console.error(error || 'database url is empty or undefined')
  process.exit(1)
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_DSN })
  await client.connect()
  const db = drizzle(client, { schema: schemas })

  // 清空旧数据
  await db.delete(answerOptionTable)
  await db.delete(quizTable)
  await db.delete(courseTable)
  await db.delete(categoryTable)

  const categories = ['国家开放大学', '自考']

  // 创建分类
  const insertedCategories = await Promise.all(
    categories.map(async (cate) => {
      const [entity] = await db.insert(categoryTable).values({ name: cate }).returning({ insertId: categoryTable.id })
      return { id: entity.insertId, name: cate }
    })
  )

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  // 拿到文件列表
  const courses = fs.readdirSync(path.resolve(__dirname, '../data'))

  for (const file of courses) {
    console.log(`fileName: ${file} 开始上传`)
    // 文件名
    const courseName = path.parse(file).name
    // 读取文件内容
    const courseJsonText = fs.readFileSync(
      path.resolve(__dirname, `../data/${file}`),
      'utf-8'
    )
    const courseJsonData = JSON.parse(courseJsonText) as JsonData

    await db.transaction(async (tx) => {
      try {
        const category = insertedCategories.find(cate => cate.name === courseJsonData.category)
        if (!category) throw new Error('找不到分类')
        // 创建课程
        const [courseEntity] = await db.insert(courseTable).values({ title: courseName, cateId: category.id }).returning({ insertId: courseTable.id })
        console.log(`创建课程: ${courseName} id: ${courseEntity.insertId}`)

        // 整理试题数据
        const quizList = courseJsonData.data.map((q) => ({
          title: q.title,
          courseId: courseEntity.insertId,
          type: q.type,
          chapter: q.chapter,
          options: q.options.map(op => ({ content: op.title, isCorrect: op.correct ?? false }))
        }))

        for (const quiz of quizList) {
          const [quizEntity] = await tx.insert(quizTable).values({ title: quiz.title, courseId: quiz.courseId, type: quiz.type, chapter: quiz.chapter }).returning({ insertId: quizTable.id })
          console.log(`创建试题 id: ${quizEntity.insertId} 题目: ${quiz.title}`)

          const answerEntities = await Promise.all(quiz.options.map(async (op) => {
            const [answerEntity] = await tx.insert(answerOptionTable).values({ content: op.content, isCorrect: op.isCorrect, quizId: quizEntity.insertId }).returning({ insertId: answerOptionTable.id })
            return answerEntity.insertId
          }))
          if (answerEntities.length === 0) throw new Error('试题答案创建失败')
        }
      } catch (error) {
        tx.rollback()
      }
    })
    console.log(`fileName: ${file} 全部上传成功`)
  }
  process.exit(0)
}

await main()
