import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PATHS } from '@/constants'

export default async function Page() {
  const session = await auth()

  if (!session?.user) {
    return redirect(PATHS.AUTH_SIGN_IN)
  } else {
    return redirect(PATHS.ADMIN_WELCOME)
  }
}
