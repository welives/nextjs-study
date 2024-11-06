'use server'

import { notFound } from 'next/navigation'
import bcrypt from 'bcrypt'
import * as UserService from '@/models/user-service'
import { isAdmin, actionFailure, actionSuccess } from '@/lib/api'
import { formatZodErrorMsg } from '@/lib/utils'
import { createUserSchema, signInSchema } from '@/dto'
import type { CreateUserData, SignInData } from '@/dto'

/**
 * 用户登录
 * @param data
 * @returns
 */
export async function userSignIn(data: SignInData) {
  try {
    const parsed = signInSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    const isExisted = await UserService.findByEmail(data.email)
    if (!isExisted) notFound()

    const passwordCompared = bcrypt.compareSync(data.password, isExisted.password)
    if (!passwordCompared) throw new Error('邮箱或密码错误')

    const user = {
      id: isExisted.id,
      name: isExisted.username,
      email: data.email,
      role: isExisted.role,
    }

    return actionSuccess(user, '登录成功')
  } catch (error: any) {
    return actionFailure(error.message)
  }
}

/**
 * 创建用户
 * @param data
 * @returns
 */
export async function createOne(data: CreateUserData) {
  try {
    if (!(await isAdmin())) throw new Error('Unauthorized')

    const parsed = createUserSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      throw new Error(msg)
    }

    const user = await UserService.createOne(data)
    return actionSuccess(user, '用户创建成功')
  } catch (error: any) {
    return actionFailure(error.message)
  }
}
