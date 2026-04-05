"use client"

import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface SectionProps {
  icon: React.ReactNode
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function Section({ icon, title, defaultOpen = false, children }: SectionProps) {
  return (
    <>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
          <div className="flex items-center gap-2">
            <span className="text-gold">{icon}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              {title}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4">
          {children}
        </CollapsibleContent>
      </Collapsible>
      <Separator className="bg-border" />
    </>
  )
}
