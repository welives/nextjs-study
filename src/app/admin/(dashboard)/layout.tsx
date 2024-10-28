import * as React from 'react'
import { redirect } from 'next/navigation'
import { AdminMainLayout } from '@/components/layouts'
import { auth } from '@/lib/auth'
import { PATHS } from '@/constants'

/**
 * 管理后台的主布局
 */
export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await auth()
  if (!session?.user) {
    return redirect(PATHS.AUTH_SIGN_IN)
  }
  return <AdminMainLayout>{children}</AdminMainLayout>
}
