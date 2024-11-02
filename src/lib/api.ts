import { NextResponse } from "next/server"
import { __DEV__ } from '../config'
import { auth } from './auth'

export async function isAdmin() {
  const session = await auth()
  if (!session?.user) return false

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

export function actionSuccess<T = any>({ data = void 0, msg = 'ok' }: ISuccess<T>) {
  return {
    success: true,
    code: 0,
    message: msg,
    data,
  }
}

export function actionFailure({ msg = 'failed', code = 'E0001', }: IFailure) {
  return {
    success: false,
    code,
    message: msg,
    data: void 0,
  }
}
