import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from '@/lib/auth.config'
import { PATHS, PUBLIC_ROUTES, AUTH_ROUTES } from '@/constants'

const { auth } = NextAuth(authConfig)

// 中间件处理逻辑
export default auth(async (req) => {
  const { nextUrl } = req
  const isSignedIn = !!req.auth // 是否已经登录
  const isApiAuthRoute = nextUrl.pathname.startsWith(PATHS.API_AUTH_PREFIX)
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)
  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname)

  // 返回空表示不用执行权限检查, 对于公开路径和鉴权接口,无需登录即可访问
  // next-auth的鉴权接口
  if (isApiAuthRoute) return NextResponse.next()

  // 需要鉴权的路由
  if (isAuthRoute) {
    // 登录后, 再访问鉴权路由时会重定向到后台
    if (isSignedIn) {
      return NextResponse.redirect(new URL(PATHS.ADMIN_HOME, nextUrl))
    } else {
      return NextResponse.next()
    }
  }

  // 没有登录时重定向到登录页
  if (!isSignedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL(PATHS.AUTH_SIGN_IN, nextUrl))
  }
})

export const config = {
  // 表示 /admin 下面的所有链接都需要登录才能访问
  // matcher: ['/admin/:path']
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
