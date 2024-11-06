import { type DefaultSession, User as NextUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends NextUser {
    role?: string
  }
}
