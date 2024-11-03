import React from 'react'
import { cn } from '@/lib/utils'

export const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <button
      ref={ref}
      className={cn(
        'px-3 py-1 rounded-md bg-primary text-primary-foreground transition-all hover:bg-primary/80 hover:cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
Button.displayName = 'Button'
