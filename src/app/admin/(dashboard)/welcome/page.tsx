'use client'

import { toast } from 'sonner'
import { Button } from '@/components/button'

export default function Page() {
  return (
    <div>
      <Button onClick={() => toast('hello world')}>welcome</Button>
    </div>
  )
}
