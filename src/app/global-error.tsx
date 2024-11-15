'use client'

import { useRouter } from 'next/navigation'

import '@/styles/globals.css'
import '@/styles/uno-cli.css'

/**
 * 全局错误页面，只在生产环境下生效
 * @returns
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()
  return (
    <html>
      <body>
        <div className="absolute-center mb-16 text-center">
          <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
            500
          </span>
          <h2 className="my-2 text-2xl font-bold">Oops! Something went wrong</h2>
          <p className="text-center text-muted-foreground">
            We apologize for the inconvenience. <br /> Please try again later.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <button
              className="px-3 py-1 rounded-md bg-primary text-primary-foreground transition-all hover:bg-primary/80 hover:cursor-pointer"
              onClick={() => router.back()}
            >
              Go back
            </button>
            <button
              className="px-3 py-1 rounded-md bg-primary text-primary-foreground transition-all hover:bg-primary/80 hover:cursor-pointer"
              onClick={() => router.push('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
