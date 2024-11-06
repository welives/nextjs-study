import path from 'node:path'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq, or } from 'drizzle-orm'
import pg from 'pg'
import inquirer from 'inquirer'
import bcrypt from 'bcrypt'
import { schemas } from '../src/lib/schema'
import { createUserSchema, CreateUserData } from '../src/dto/user.dto'

const rootDir = path.resolve(process.cwd(), './')
const { parsed, error } = dotenv.config({ path: `${rootDir}/.env.local` })
if (error || [void 0, ''].indexOf(parsed!.DATABASE_DSN) !== -1) {
  console.error(error || 'database url is empty or undefined')
  process.exit(1)
}

const { user: userSchema } = schemas

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_DSN })
  await client.connect()
  const db = drizzle(client, { schema: schemas })

  const { username } = await inquirer.prompt([{ name: 'username', message: '请输入用户名', type: 'input' }])

  const { email } = await inquirer.prompt([{ name: 'email', message: '请输入邮箱', type: 'input' }])

  const { password } = await inquirer.prompt([{ name: 'password', message: '请输入密码', type: 'input' }])

  const { role } = await inquirer.prompt([{ name: 'role', message: '请选择一个角色', type: 'list', choices: ['admin', 'user'] }])

  const data: CreateUserData = {
    username,
    email,
    password,
    role
  }
  const parsed = createUserSchema.safeParse(data)
  if (!parsed.success) {
    console.error('用户信息校验失败')
    process.exit(1)
  }

  const isExisted = await db.query.user.findFirst({
    where: or(eq(userSchema.username, username), eq(userSchema.email, email)),
    columns: {
      id: true
    }
  })
  if (isExisted) {
    console.error('用户名或邮箱已被占用')
    process.exit(1)
  }
  const encryptPassword = bcrypt.hashSync(password, 10)
  const [entity] = await db.insert(userSchema).values({ username, email, password: encryptPassword, role }).returning({ insertId: userSchema.id })

  if (!entity) {
    console.error('用户创建失败')
    process.exit(1)
  }

  console.log('用户创建成功')
  process.exit(0)
}

await main()
