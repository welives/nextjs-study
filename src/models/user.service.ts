import { cache } from 'react'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcrypt'

import { getConnection } from '@/lib/drizzle'
import { userTable, UserRole } from '@/lib/schema'
import { CreateUserData } from '@/dto'

/**
 * 根据邮箱查找用户
 */
export const findByEmail = cache(async (email: string) => {
  const db = await getConnection()
  const res = await db.query.user.findFirst({
    where: eq(userTable.email, email)
  })

  return res
})


/**
 * 创建用户
 * @param param
 * @returns
 */
export async function createOne({ username, email, ...rest }: CreateUserData) {
  const db = await getConnection()
  const isExisted = await db.query.user.findFirst({
    where: or(eq(userTable.username, username), eq(userTable.email, email)),
    columns: {
      id: true
    }
  })
  if (isExisted) throw new Error('用户名或邮箱已被占用')

  const encryptPassword = bcrypt.hashSync(rest.password, 10)

  const [entity] = await db.insert(userTable).values({ username, email, password: encryptPassword, role: rest.role ?? UserRole.USER }).returning()
  if (!entity) throw new Error('用户创建失败')
  const { password, ...user } = entity
  return user
}
