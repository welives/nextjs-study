'use client'

import { useRouter } from 'next/navigation'
import { Button } from 'antd'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="absolute-center mb-16 text-center">
      <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
        404
      </span>
      <h2 className="my-2 text-2xl font-bold">Something&apos;s missing</h2>
      <p>Sorry, the page you are looking for doesn&apos;t exist or has been moved.</p>
      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={() => router.back()}>Go back</Button>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    </div>
  )
}
