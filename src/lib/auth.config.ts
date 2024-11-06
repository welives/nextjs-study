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
        id: {},
        name: {},
        email: {},
        role: {},
      },
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
    signIn: PATHS.AUTH_SIGN_IN,
  },
} satisfies NextAuthConfig
