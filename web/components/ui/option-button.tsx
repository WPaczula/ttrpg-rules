import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const optionButtonVariants = cva(
  'rounded-md border text-sm font-medium transition-colors active:scale-95 disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      size: {
        default: 'px-3 py-1.5',
        sm: 'px-2 py-1 text-xs',
        square: 'w-10 h-10',
      },
      active: {
        true: 'bg-gold/15 text-gold border-gold/30',
        false:
          'bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50',
      },
    },
    defaultVariants: {
      size: 'default',
      active: false,
    },
  },
)

function OptionButton({
  className,
  size,
  active,
  type = 'button',
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof optionButtonVariants>) {
  return (
    <button
      type={type}
      data-slot="option-button"
      data-active={active ? 'true' : undefined}
      className={cn(optionButtonVariants({ size, active }), className)}
      {...props}
    />
  )
}

export { OptionButton, optionButtonVariants }
