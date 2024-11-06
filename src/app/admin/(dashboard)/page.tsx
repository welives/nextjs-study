import { redirect } from 'next/navigation'
import { PATHS } from '@/constants'

export default function Page() {
  return redirect(PATHS.ADMIN_WELCOME)
}
