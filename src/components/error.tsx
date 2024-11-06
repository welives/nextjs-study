'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
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
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
