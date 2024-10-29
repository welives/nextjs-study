import { NextResponse } from "next/server"

import { auth } from './auth'

export async function isAdmin() {
  const session = await auth()
  if (!session?.user?.id) return false
  const adminIds = process.env.ADMIN_IDS.split(', ')

  return adminIds.indexOf(session.user.id) !== -1
}

export function success({ data = null, msg = 'ok', status = 200 } = {}) {
  return NextResponse.json({
    success: true,
    code: 0,
    message: msg,
    data
  }, { status })
}

export function failure({ msg = 'failed', code = 'E0001', status = 400 } = {}) {
  return NextResponse.json({
    success: false,
    code,
    message: msg,
  }, { status })
}
