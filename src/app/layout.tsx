import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'
import { Inter } from 'next/font/google'

import { AuthProvider, AntdStyleRegistry } from '@/components/layouts'
import { Toaster } from '@/components/toaster'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/api'
import { useSettingStore } from '@/store'

import '@/styles/globals.css'
import '@/styles/uno-cli.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Next Admin',
  description: 'Next Admin',
}

/**
 * 这是一个服务端组件，它是整个应用的主布局文件，相当于React的main.ts或App.tsx
 * 它主要做以下几个事情
 * - 项目 metadata
 * - 加载全局样式 globals.css
 * - 加载网络/本地字体
 * - 定义应用顶级布局
 * - 国际化 i18n
 * - 第三方组件库 Provider Wrapper
 *
 * 顶层 RootLayout 作用于所有页面，各个子 Layout 只作用于自己所属的目录下的所有页面
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  if (session && session?.user?.id) {
    const setIsAdmin = useSettingStore.getState().setIsAdmin
    setIsAdmin(await isAdmin())
  }
  return (
    <html lang="en">
      <link rel="icon" type="image/svg+xml" href="favicon.svg" />
      <link rel="icon" type="image/png" href="favicon.png" />
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader showSpinner={false} />
        <Toaster />
        <AuthProvider session={session}>
          <AntdStyleRegistry>{children}</AntdStyleRegistry>
        </AuthProvider>
      </body>
    </html>
  )
}
