import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type FieldLabelProps = React.ComponentProps<'label'> & {
  asChild?: boolean
}

function FieldLabel({ className, asChild = false, ...props }: FieldLabelProps) {
  const Comp = asChild ? Slot : 'label'

  return (
    <Comp
      data-slot="field-label"
      className={cn(
        'text-xs font-medium text-muted-foreground uppercase tracking-wider',
        className,
      )}
      {...props}
    />
  )
}

export { FieldLabel }
