'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { LoginFormPage, ProConfigProvider, ProFormCheckbox, ProFormText } from '@ant-design/pro-components'
import { message } from 'antd'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants'

export default function Page() {
  // 客户端获取session的方式
  const { data: session } = useSession()
  const router = useRouter()
  if (session) {
    return router.replace(PATHS.ADMIN_HOME)
  }
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const [loading, startTransition] = React.useTransition()
  // 提交表单
  function onSubmit(data: any) {
    startTransition(() => {
      signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: callbackUrl ?? PATHS.ADMIN_HOME,
      })
      message.success('登录成功')
    })
  }
  return (
    <ProConfigProvider dark hashed={false}>
      <LoginFormPage
        onFinish={onSubmit}
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        logo={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-primary-foreground"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
          </svg>
        }
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="Next Admin"
        containerStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(4px)',
        }}
        subTitle="Nextjs + Antd Design"
      >
        <ProFormText
          name="email"
          fieldProps={{
            type: 'email',
            size: 'large',
            prefix: <UserOutlined className={cn('text-secondary-foreground')} />,
          }}
          placeholder={'邮箱: admin@gmail.com'}
          rules={[
            {
              required: true,
              message: '请输入邮箱!',
            },
            {
              type: 'email',
              message: '邮箱格式不正确',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined className={cn('text-secondary-foreground')} />,
          }}
          placeholder={'密码: ant.design'}
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        />

        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a className="float-right">忘记密码</a>
        </div>
      </LoginFormPage>
    </ProConfigProvider>
  )
}
