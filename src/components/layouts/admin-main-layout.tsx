'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useMount } from 'react-use'
import { Dropdown, Spin, MenuProps } from 'antd'
import { PageContainer, ProLayout, ProSkeleton } from '@ant-design/pro-components'
import type { MenuDataItem } from '@ant-design/pro-components'
import { HeartOutlined, SmileOutlined, LogoutOutlined, DesktopOutlined } from '@ant-design/icons'
import { ROUTES, PATHS } from '@/constants'

const menuIconMap = {
  smile: <SmileOutlined />,
  heart: <HeartOutlined />,
}

const items: MenuProps['items'] = [
  {
    key: 'home',
    icon: <DesktopOutlined />,
    label: '前往首页',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
  },
]

const loopMenuItem = (menus: any[]): MenuDataItem[] =>
  menus.map(({ icon, routes, ...item }) => ({
    ...item,
    icon: icon && menuIconMap[icon as 'smile'],
    children: routes && loopMenuItem(routes),
  }))

export function AdminMainLayout({ children }: React.PropsWithChildren) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()

  const onClick: MenuProps['onClick'] = (event) => {
    if (event.key === 'home') router.push(PATHS.SITE_HOME)
    if (event.key === 'logout') signOut()
  }

  useMount(() => {
    setMounted(true)
  })
  if (!mounted) {
    return <ProSkeleton></ProSkeleton>
  }

  return (
    <ProLayout
      title="Next Admin"
      logo={
        <div className="size-7">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-foreground"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
          </svg>
        </div>
      }
      layout="mix"
      location={{ pathname }}
      menu={{ request: async () => loopMenuItem(ROUTES) }}
      menuItemRender={(item, dom) => <Link href={item.path!}>{dom}</Link>}
      avatarProps={{
        src: (
          <div className="size-7">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-foreground"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
            </svg>
          </div>
        ),
        title: '煎蛋',
        size: 'small',
        render: (props, dom) => <Dropdown menu={{ items, onClick }}>{dom}</Dropdown>,
      }}
    >
      <PageContainer header={{ title: false }}>
        <React.Suspense fallback={<Spin />}>{children}</React.Suspense>
      </PageContainer>
    </ProLayout>
  )
}
