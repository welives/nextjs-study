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

interface ISuccess {
  data?: any
  msg?: string
  status?: number
}

export function success({ data = null, msg = 'ok', status = 200 }: ISuccess) {
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
  }, { status })
}

export function actionSuccess({ data = null, msg = 'ok', status = 200 }: ISuccess) {
  return {
    success: true,
    code: 0,
    message: msg,
    data,
    status
  }
}

export function actionFailure({ msg = 'failed', code = 'E0001', status = 400 }) {
  return {
    success: false,
    code,
    message: msg,
    status
  }
}
