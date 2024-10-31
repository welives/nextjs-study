import { NextResponse, NextRequest } from "next/server"
import { z, ZodError } from 'zod'
import { getList } from '@/db/quiz-service'
import { success, failure } from '@/lib/api'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  try {
    const pageSize = z.coerce.number().parse(url.searchParams.get('pageSize'))
    const page = z.coerce.number().parse(url.searchParams.get('page'))
    const keyword = url.searchParams.get('keyword')

    const data = await getList({ page, limit: pageSize, keyword })

    return success({ data })
  } catch (error: any) {
    let msg = '未知错误'
    if (error instanceof ZodError) {
      msg = '参数异常'
    }
    return failure({ msg })
  }
}
