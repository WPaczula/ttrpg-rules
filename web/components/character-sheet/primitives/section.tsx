"use client"

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
    <Collapsible defaultOpen={defaultOpen} className="group">
      <CollapsibleTrigger className="dh-ribbon cursor-pointer">
        <div className="dh-ribbon-line" aria-hidden />
        <div className="dh-ribbon-box">
          <span className="text-gold flex items-center">{icon}</span>
          <span>{title}</span>
          <ChevronDown className="w-3 h-3 text-gold-dim transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
        </div>
        <div className="dh-ribbon-line right" aria-hidden />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
