import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import authConfig from '@/lib/auth.config'
import { PATHS, BASE_URL } from '@/constants'

const { auth } = NextAuth(authConfig)

// 中间件处理逻辑
export default auth(async (req) => {
  if (!req.auth) {
    const url = new URL(PATHS.AUTH_SIGN_IN, BASE_URL ?? req.nextUrl.origin)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  // 表示 /admin 下面的所有链接都需要登录才能访问
  matcher: ['/admin/:path']
}
