import * as React from 'react'

import { cn } from '@/lib/utils'

function StepperButton({
  className,
  type = 'button',
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type={type}
      data-slot="stepper-button"
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground text-sm hover:bg-secondary active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}

export { StepperButton }
