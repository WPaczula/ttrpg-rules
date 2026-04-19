import * as React from 'react'

import { cn } from '@/lib/utils'

function IconTag({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="icon-tag"
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-background/50 border border-border px-2 py-1 text-xs',
        className,
      )}
      {...props}
    />
  )
}

export { IconTag }
