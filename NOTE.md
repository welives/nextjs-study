#### 开发随记

## UNOCSS在Nextjs 14中不能正常解析的写法

`transformerCompileClass`和`transformerVariantGroup` 不支持

先说结论：尽量写在`className`里

不支持解析的写法，不完全统计

```js
grid="~ xxx"
position="relative xxx"
absolute="~ xxx"
flex="1"
border="~ xxx"
text="xxx"
shadow="xxx"
```

---

## 目录类型

|页面目录|动态路由目录|虚拟目录|Api目录|私有目录|
|:-:|:-:|:-:|:-:|:-:|
|`admin`|`[slug]`|`(root)`|`api`|`_components`|

虚拟目录是一个以`()`包起来的目录，它不影响路由的访问，直接放在`app`目录下的页面和放在虚拟目录下的效果是一样的。专门把页面放进虚拟目录只是为了区别根路由`/`以及`app`下的其他功能目录，比如`api`路由

## 页面路由

|访问|App Router|Page Router|
|:-:|:-:|:-:|
|`/`|`app/page.tsx`|`pages/index.tsx`|
|`/admin`|`app/admin/page.tsx`|`pages/admin/index.tsx`|
|`/post/1`|`app/post/[id]/page.tsx`|`pages/post/[id]/index.tsx` 或 `pages/post/[id].tsx`|
|`/test/1/a`|`app/test/[...slug]/page.tsx`|`pages/test/[...slug]/index.tsx` 或 `pages/test/[...slug].tsx`|

## Api路由

`api`目录要放置在`app`目录下，而且必须命名为`route.ts`

|访问|App Router|Page Router|
|:-:|:-:|:-:|
|`api/post`|`app/api/post/route.ts`|`pages/api/post/index.ts`|
|`api/post/1`|`app/api/post/[id]/route.ts`|`pages/api/post/[id]/index.ts` 或 `pages/api/post/[id].ts`|

## next-auth

- 在根目录或者`lib`目录下创建`auth.ts`和`auth.config.ts`两个文件，主要用来处理鉴权逻辑

```ts
// auth.config.ts
import { NextAuthConfig } from 'next-auth'
import CredentialProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'

export default {
  providers: [
    /** @see https://next-auth.js.org/providers/github */
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    /**
     * 自定义口令登录
     * @see https://next-auth.js.org/configuration/providers/credentials
     */
    CredentialProvider({
      credentials: {
        email: { label: '邮箱', type: 'email', placeholder: 'admin@google.com' },
        password: { label: '密码', type: 'password', },
      },
      async authorize(credentials, req) {
        // 在这里写自己的账号密码逻辑检验, 例如请求自己的接口或远端服务器
        const user = {
          id: '1',
          name: 'Jandan',
          email: credentials?.email as string,
        }
        // 这里为了简单演示,直接不校验
        if (user) {
          return user
        } else {
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
} satisfies NextAuthConfig
```

```ts
// auth.ts
import NextAuth from 'next-auth'
import authConfig from './auth.config'

export const { auth, handlers, signOut, signIn } = NextAuth(authConfig)
```

- 创建`app/api/auth/[...nextauth]/route.ts`文件，用来处理`next-auth`的接口

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- 在登录页的表单组件中编写前端的登录逻辑

```tsx
'use client'
import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  email: z.string().min(1, { message: '请输入邮箱' }).email({ message: '邮箱格式不正确' }),
  password: z.string().min(1, { message: '请输入密码' }).min(6, { message: '密码长度至少6位' }),
})

export function CredentialsForm({ className, ...props }: SignInFormProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const [loading, startTransition] = React.useTransition()

  // 使用zod校验用户输入
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 提交表单
  function onSubmit(data: z.infer<typeof formSchema>) {
    startTransition(() => {
      signIn('credentials', {
        ...data,
        callbackUrl: callbackUrl ?? '/admin',
      })
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        // ...
      </form>
    </Form>
  )
}
```

- 创建`AuthProvider`，用来管理整个应用的`session`

```tsx
import { SessionProvider, SessionProviderProps } from 'next-auth/react'
import { ThemeProvider } from './theme'

export function AuthProvider({
  session,
  children,
}: {
  session: SessionProviderProps['session']
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>{children}</SessionProvider>
    </ThemeProvider>
  )
}
```

- 根据自己的情况在合适的位置应用`AuthProvider`。我这里简单的以根布局`RootLayout`为例，这表示整个应用的访问都受`next-auth`管控

```tsx
import { AuthProvider } from '@/components/auth-provider'
import { auth } from '@/lib/auth'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 服务端获取session的方式
  const session = await auth()
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden`} suppressHydrationWarning>
        <NextTopLoader showSpinner={false} />
        <AuthProvider session={session}>
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

- 设置中间件

```ts
import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import authConfig from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

// 中间件处理逻辑
export default auth(async (req) => {
  if (!req.auth) {
    const url = new URL('/auth/sign-in', req.nextUrl.origin)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  // 表示 /admin 下面的所有链接都需要登录才能访问
  matcher: ['/admin/:path']
}
```

## TailwindCSS

- `&`是选择器的占位符
- 在`[]`中写任意选择器时，使用下划线`_`来代替`空格`

### 基于父元素状态的样式

常见写法

- `group-{modifier}/{name}`，基于命名的父元素的状态

```css
group-hover/edit:xxx
```

- `group-{modifier}`，基于匿名的父元素的状态，匿名时是找离它最近的带有`group`类的元素

```css
group-hover:xxx
```

- `group-data-[]:{modifier}`，基于匿名父元素的某个数据属性

```css
group-data-[variant=inset]:xxx
```

- `group-[[][]]:{modifier}`，基于匿名父元素的多个状态

```css
group-[[data-state=expanded][data-variant=inset]]:xxx
```


### 基于兄弟状态的样式

常见写法

- `peer-{modifier}/{name}`，基于命名的兄弟元素的状态

```css
peer-hover/edit:xxx
```

- `peer-{modifier}`，基于匿名的兄弟元素的状态，匿名时是找离它最近的带有`peer`类的元素

```css
peer-hover:xxx
```

- `peer-data-[]:{modifier}`，基于匿名兄弟元素的某个数据属性

```css
peer-data-[variant=inset]:xxx
```

- `peer-[[][]]:{modifier}`，基于匿名兄弟元素的多个状态

```css
peer-[[data-state=expanded][data-variant=inset]]:xxx
```

### 基于后代状态的样式

常见写法

- `has-{modifier}`，基于后代元素的某个状态

```css
has-[:checked]:xxx
has-[data-variant=inset]:xxx
```

- `group-has-[[]]:{modifier}`，基于匿名父元素的后代的某个状态

```css
group-has-[[data-state=expanded]]:xxx
```

- `group-has-[[]]:{modifier}/{name}`，基于命名父元素的后代的某个状态

```css
group-has-[[data-variant=inset]]/root:xxx
```

- `peer-has-[[]]:{modifier}`，基于匿名兄弟元素的后代的某个状态

```css
peer-has-[[data-state=expanded]]:xxx
```

- `peer-has-[[]]:{modifier}/{name}`，基于命名兄弟元素的后代的某个状态

```css
peer-has-[[data-variant=inset]]/root:xxx
```
