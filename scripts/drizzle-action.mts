import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import inquirer from 'inquirer'
import shell from 'shelljs'

interface Q1 {
  env: string
}

interface Q2 {
  action: string
}

const rootDir = path.resolve(process.cwd(), './')

/**
 * 搜索主项目根目录下的环境变量文件
 * @returns
 */
async function searchEnvFiles(): Promise<string[]> {
  const files = fs.readdirSync(rootDir)
  const res = files.filter((file) => file.startsWith('.env')).filter((file) => file.indexOf('example') === -1)
  if (res.length === 0) {
    console.error('There is no found any environment files, please create it and run again!')
    process.exit(1)
  }
  return res
}

async function questions() {
  let qa1: Q1 = { env: '' }
  let qa2: Q2 = { action: '' }
  const envFiles = await searchEnvFiles()
  qa1 = await inquirer.prompt([{ name: 'env', message: 'Select your environment', type: 'list', choices: envFiles }])

  qa2 = await inquirer.prompt([
    { name: 'action', message: 'Which action you want to do?', type: 'list', choices: ['generate', 'migrate', 'push'] },
  ])

  return { qa1, qa2 }
}

/**
 * 此脚本主要功能是以命令行交互的方式执行
 *
 * 1.检查环境变量文件
 * 2.选择环境变量文件
 * 3.执行数据库迁移操作
 */
async function main() {
  const { qa1, qa2 } = await questions()
  const { parsed, error } = dotenv.config({ path: path.resolve(rootDir, qa1.env) })
  if (error || [void 0, ''].indexOf(parsed?.DATABASE_DSN) !== -1) {
    console.error(error || 'database url is empty or undefined')
    process.exit(1)
  }

  // generate 是生成迁移文件，更新模型schema文件后需要执行
  // migrate 是执行迁移操作，也就是把表结构的改动实际应用到数据库中
  // push 跳过生成迁移文件的步骤，直接改动数据库中的表结构，一般用于开发环境和模型设计阶段
  shell.exec(`drizzle-kit ${qa2.action}`)
  console.log('Congratulations, all done')
  process.exit(0)
}
await main()
