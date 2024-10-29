import { NextResponse, NextRequest } from "next/server"
import { z, ZodError } from 'zod'
import { getCategories } from '@/db/queries'
import { success, failure, isAdmin } from '@/lib/api'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  try {
    const pageSize = z.coerce.number().parse(url.searchParams.get('pageSize'))
    const page = z.coerce.number().parse(url.searchParams.get('page'))
    const keyword = url.searchParams.get('keyword')
    const isSelect = url.searchParams.get('is-select') === 'true'

    const data = getCategories({ page, pageSize, keyword, isPaginate: !isSelect })

    return success({ data })
  } catch (error: any) {
    let msg = ''
    if (error instanceof ZodError) {
      msg = '参数异常'
    }
    return failure({ msg })
  }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const data = await req.json()
  return success(data)
}
