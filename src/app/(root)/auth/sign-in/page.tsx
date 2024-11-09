'use client'

import { useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { LoginFormPage, ProConfigProvider, ProFormText } from '@ant-design/pro-components'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

import { cn, formatZodErrorMsg } from '@/lib/utils'
import { userSignIn } from '@/actions/user.action'
import { signInSchema } from '@/dto'
import { PATHS } from '@/constants'

export default function Page() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const [isPending, startTransition] = useTransition()
  // 提交表单
  function onSubmit(data: any) {
    const parsed = signInSchema.safeParse(data)
    if (!parsed.success) {
      const msg = formatZodErrorMsg(parsed.error.issues)
      toast.error(msg)
      return
    }

    startTransition(async () => {
      // 因为drizzle-orm不能在中间件进行数据库操作,所以改成在这里调用action进行用户登录校验
      const res = await userSignIn({ email: data.email, password: data.password })
      toast.success(res.message)
      if (res.success) {
        // 把校验通过的用户信息提交给next-auth, 会在authorize方法中接收到数据
        await signIn('credentials', {
          ...res.data,
          redirectTo: callbackUrl ?? PATHS.SITE_HOME,
        })
      }
    })
  }
  return (
    <ProConfigProvider dark hashed={false}>
      <LoginFormPage
        onFinish={onSubmit}
        loading={isPending}
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
          placeholder={'邮箱: jandan@qq.com'}
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
          placeholder={'密码: 123456'}
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        />
      </LoginFormPage>
    </ProConfigProvider>
  )
}
