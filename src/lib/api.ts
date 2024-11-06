import { NextResponse } from "next/server"
import { __DEV__ } from '../config'
import { auth } from './auth'
import { UserRole } from './schema'

export async function isAdmin() {
  const session = await auth()
  if (!session?.user) return false
  if (session.user.role !== UserRole.ADMIN) return false

  if (!__DEV__) {
    const adminIds = `${process.env.ADMIN_IDS}`.split(', ')
    return adminIds.indexOf(`${session.user.id}`) !== -1
  }
  return true
}

interface ISuccess<T = any> {
  data?: T
  msg?: string
  status?: number
}

export function success<T = any>({ data = void 0, msg = 'ok', status = 200 }: ISuccess<T>) {
  return NextResponse.json({
    success: true,
    code: 0,
    message: msg,
    data
  }, { status })
}

interface IFailure {
  msg?: string
  code?: string | number
  status?: number
}

export function failure({ msg = 'failed', code = 'E0001', status = 400 }: IFailure) {
  return NextResponse.json({
    success: false,
    code,
    message: msg,
    data: void 0
  }, { status })
}

export function actionSuccess<T = any>(data: T, message = 'ok') {
  return {
    success: true,
    message,
    data
  }
}

export function actionFailure(message = 'Something went wrong') {
  return {
    success: false,
    message,
    data: void 0,
  }
}
