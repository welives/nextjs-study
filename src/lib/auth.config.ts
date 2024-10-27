import { NextAuthConfig } from 'next-auth'
import CredentialProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET, __DEV__ } from '@/config'
import { PATHS } from '@/constants'

export default {
  providers: [
    /**
     * @see https://next-auth.js.org/providers/github
     */
    GithubProvider({
      clientId: AUTH_GITHUB_ID ?? '',
      clientSecret: AUTH_GITHUB_SECRET ?? '',
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
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  secret: AUTH_SECRET,
  callbacks: {
    session({ session, user }) {
      return session
    },
  },
  session: { strategy: 'jwt' },
  debug: __DEV__,
  pages: {
    signIn: PATHS.AUTH_SIGN_IN,
  },
} satisfies NextAuthConfig
