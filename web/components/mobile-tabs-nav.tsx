"use client"

import { usePathname, useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface MobileTabsNavProps {
  tabs: { href: string; icon: LucideIcon; label: string }[]
}

export function MobileTabsNav({ tabs }: MobileTabsNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-stretch justify-around">
        {tabs.map(({ href, icon: Icon, label }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
              pathname === href ? "text-gold" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
