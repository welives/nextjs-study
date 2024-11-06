'use client'

import { useRouter } from 'next/navigation'
import { PATHS } from '@/constants'

/**
 * 局部NotFound, 用于处理接口返回404的情况,需要手动调用`next/navigation`的`notFound`方法
 * @returns
 */
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
        <button
          className="px-3 py-1 rounded-md bg-primary text-primary-foreground transition-all hover:bg-primary/80 hover:cursor-pointer"
          onClick={() => router.back()}
        >
          Go back
        </button>
        <button
          className="px-3 py-1 rounded-md bg-primary text-primary-foreground transition-all hover:bg-primary/80 hover:cursor-pointer"
          onClick={() => router.push(PATHS.ADMIN_HOME)}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
