'use server'

import { cache } from 'react'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import db from '@/db/drizzle'
import * as CategoryService from '@/db/category-service'
import { isAdmin } from '@/lib/api'
import { findChildren } from '@/lib/utils'

export const getAll = cache(async () => {
  const res = await db.query.category.findMany({
    columns: {
      id: true,
      name: true,
      pid: true
    }
  })

  const data = res.map((e) => {
    const children = findChildren<string>(res, [e.id])
    return { ...e, childIds: children }
  })

  return data
})

export const createOne = async (data: CategoryService.ICreateOrUpdate) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await CategoryService.createOne(data)
  /**
   * server action 返回给客户端组件的数据只能是简单的原始类型或简单的对象
   */
  return res
}

export const updateOne = async (data: CategoryService.ICreateOrUpdate) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await CategoryService.updateOne(data)
  return res
}

export const deleteOne = async (id: string) => {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const res = await CategoryService.deleteOne(id)
  revalidatePath('/admin/category')
  return res
}
