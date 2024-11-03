'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/button'
import { PATHS } from '@/constants'

export default function HomePage() {
  // 客户端获取session的方式
  const { data: session } = useSession()
  const router = useRouter()
  return (
    <div className="flex flex-col h-dvh">
      <header className="shrink-0 h-15 px-8 py-3">
        <nav className="flex gap-4 items-center justify-end h-full">
          {session ? (
            <Button onClick={() => router.push(PATHS.ADMIN_HOME)}>后台管理</Button>
          ) : (
            <Button onClick={() => router.push(PATHS.AUTH_SIGN_IN)}>登录</Button>
          )}
        </nav>
      </header>
      <main className="relative flex-1 mx-a py-4 w-screen-xl">main</main>
      <footer className="shrink-0 h-15">footer</footer>
    </div>
  )
}
