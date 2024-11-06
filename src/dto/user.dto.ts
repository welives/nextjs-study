import { z } from 'zod'
import { requiredMessage } from '@/constants'
import { UserRole } from '@/lib/schema'

export const userIdSchema = z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('用户ID') })

export const createUserSchema = z.object({
  username: z.string({ message: '不是一个字符串' }).min(2, { message: requiredMessage('用户名') }),
  email: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('邮箱') }).email({ message: '邮箱格式不正确' }),
  password: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('密码') }).min(6, { message: '密码长度至少6位' }),
  role: z.nativeEnum(UserRole, { message: '不是一个合法的枚举值' }).optional(),
})
export type CreateUserData = z.infer<typeof createUserSchema>

export const signInSchema = z.object({
  email: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('邮箱') }).email({ message: '邮箱格式不正确' }),
  password: z.string({ message: '不是一个字符串' }).min(1, { message: requiredMessage('密码') })
})
export type SignInData = z.infer<typeof signInSchema>
