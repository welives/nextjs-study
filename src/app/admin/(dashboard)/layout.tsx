import * as React from 'react'
import { AdminMainLayout } from '@/components/layouts'

/**
 * 管理后台的主布局
 */
export default function Layout({ children }: React.PropsWithChildren) {
  return <AdminMainLayout>{children}</AdminMainLayout>
}
