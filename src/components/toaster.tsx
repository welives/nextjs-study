'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type SonnerProps = React.ComponentProps<typeof Sonner>

export function Toaster(props: SonnerProps) {
  const { theme = 'system' } = useTheme()
  return (
    <Sonner
      theme={theme as SonnerProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}
