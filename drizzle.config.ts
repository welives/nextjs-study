import type { Config } from 'drizzle-kit'

if ([void 0, ''].indexOf(process.env.DATABASE_DSN) !== -1) {
  console.error('database url is empty or undefined')
  process.exit(1)
}

export default {
  schema: './src/db/schemas/*', // 模型文件目录
  out: './drizzle', // 迁移文件的输出目录
  dialect: 'postgresql', // 数据库引擎
  dbCredentials: {
    url: `${process.env.DATABASE_DSN}`,
  },
} satisfies Config
