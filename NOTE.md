#### 开发随记

## UNOCSS在Nextjs 中并不是所有功能都支持

`transformerCompileClass`和`transformerVariantGroup` 这两个预设不支持

然后样式类的话尽量写在`className`里

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

- 在`src/app/lib`目录下创建`auth.ts`和`auth.config.ts`两个文件，主要用来处理鉴权逻辑

```ts
// auth.config.ts
import { NextAuthConfig } from 'next-auth'
import CredentialProvider from 'next-auth/providers/credentials'
import { AUTH_SECRET, __DEV__ } from '@/config'

export default {
  providers: [
    /**
     * 自定义口令登录
     * @see https://next-auth.js.org/configuration/providers/credentials
     */
    CredentialProvider({
      credentials: {
        id: {},
        name: {},
        email: {},
        role: {},
      },
      /**
       * 在这里写自己的账号密码逻辑检验, 例如请求自己的接口或远端服务器
       * 但是`drizzle-orm`不像`prima`那样能在中间件进行数据库操作,会报找不到node的原生模块的错误
       * 所以换个姿势, 把登录验证的操作放到server action去做, 验证成功后返回用户信息
       * 然后调用signIn方法把验证通过的用户数据提交过来
       * @param credentials next-auth的signIn方法提交的数据会塞进这个参数
       * @param req
       * @returns
       */
      async authorize(credentials, req) {
        const user = {
          id: credentials.id as string,
          name: credentials.name as string,
          email: credentials.email as string,
          role: credentials.role as string
        }
        return user ?? null
      },
    }),
  ],
  callbacks: {
    // 执行顺序 signIn => jwt => session
    async signIn({ user, account, }) {
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    // 可在session中读到在jwt方法返回的token值，可将需要的属性放到session中，如角色、权限等
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: AUTH_SECRET,
  session: { strategy: 'jwt' },
  debug: __DEV__,
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

- 在`src/types`目录下创建`next-auth.d.ts`，用来扩展`next-auth`的类型

```ts
import { type DefaultSession, User as NextUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends NextUser {
    role?: string
  }
}
```

- 创建`src/app/api/auth/[...nextauth]/route.ts`文件，用来处理`next-auth`的接口

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- 在登录页编写前端的登录逻辑

```tsx
'use client'

import { useTransition } from 'react'
import { signIn } from 'next-auth/react'
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
    ...
  )
}
```

- 创建`AuthProvider`，用来管理整个应用的`session`

```tsx
import { SessionProvider, SessionProviderProps } from 'next-auth/react'
import { ThemeProvider } from '../theme'

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
import NextTopLoader from 'nextjs-toploader'
import { AuthProvider, AntdStyleRegistry } from '@/components/layouts'
import { Toaster } from '@/components/toaster'
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
```

- 设置中间件

```ts
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
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
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
