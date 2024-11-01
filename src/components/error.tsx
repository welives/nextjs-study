'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>出错啦!</h2>
      <button
        className="px-3 py-1 rounded-md bg-primary text-primary-foreground transition-all hover:bg-primary/80 hover:cursor-pointer"
        onClick={() => reset()}
      >
        重试
      </button>
    </div>
  )
}
