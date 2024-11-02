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
