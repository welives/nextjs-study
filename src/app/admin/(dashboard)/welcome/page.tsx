'use client'

import { toast } from 'sonner'

export default function Page() {
  return (
    <div>
      <button
        className="px-3 py-1 rounded-md bg-primary text-primary-foreground transition-all hover:bg-primary/80 hover:cursor-pointer"
        onClick={() => toast('hello world')}
      >
        welcome
      </button>
    </div>
  )
}
