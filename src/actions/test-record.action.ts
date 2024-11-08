'use server'

import { cache } from 'react'
import { z } from 'zod'
import * as RecordService from '@/models/test-record.service'
import { actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { requiredMessage } from '@/constants'

const idSchema = z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('记录ID') })

export const getOne = cache(async (id: string) => {
  try {
    const parsed = idSchema.safeParse(id)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    const data = await RecordService.findById(id)
    return actionSuccess(data)
  } catch (error: any) {
    return actionFailure(error.message)
  }
})
