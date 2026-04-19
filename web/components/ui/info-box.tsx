import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const infoBoxVariants = cva(
  'border border-border rounded-lg p-3 space-y-1',
  {
    variants: {
      variant: {
        purple: 'bg-purple-deep/30',
        card: 'bg-card',
        subtle: 'bg-card/50',
      },
    },
    defaultVariants: {
      variant: 'purple',
    },
  },
)

function InfoBox({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof infoBoxVariants>) {
  return (
    <div
      data-slot="info-box"
      className={cn(infoBoxVariants({ variant }), className)}
      {...props}
    />
  )
}

function InfoBoxHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="info-box-header"
      className={cn(
        'flex items-center gap-2 text-sm font-medium text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function InfoBoxDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="info-box-description"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

export { InfoBox, InfoBoxHeader, InfoBoxDescription, infoBoxVariants }
