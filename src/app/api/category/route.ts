import { NextResponse, NextRequest } from "next/server"
import { getList } from '@/models/category.service'
import { success, failure } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { listPageSchema } from '@/dto'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)

  const params = {
    limit: url.searchParams.get('limit') ?? 20,
    page: url.searchParams.get('page') ?? 1,
    keyword: url.searchParams.get('keyword')
  }

  const parsed = listPageSchema.safeParse(params)
  if (!parsed.success) {
    return failure({ msg: formatZodErrorMsg(parsed.error.issues) })
  }
  const data = await getList({ page: Number(params.page), limit: Number(params.limit), keyword: params.keyword })
  return success({ data })
}
