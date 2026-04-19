import * as React from 'react'

import { cn } from '@/lib/utils'

function StatTile({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="stat-tile"
      className={cn(
        'rounded-md bg-background/50 border border-border-strong py-1.5 px-1 space-y-0.5',
        className,
      )}
      {...props}
    />
  )
}

function StatTileLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="stat-tile-label"
      className={cn(
        'font-mono text-[9px] uppercase tracking-[0.14em] text-gold-dim',
        className,
      )}
      {...props}
    />
  )
}

function StatTileValue({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="stat-tile-value"
      className={cn('font-display text-sm font-semibold text-gold', className)}
      {...props}
    />
  )
}

export { StatTile, StatTileLabel, StatTileValue }
