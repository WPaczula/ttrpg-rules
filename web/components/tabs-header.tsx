"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"
import { User, Shield, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface TabsHeaderProps {
  tabs: { href: string; icon: LucideIcon; label: string }[]
  role: "GM" | "PC" | "DEMO"
}

const pcHrefs = ["/chat", "/sheet", "/levelup"]
const gmHrefs = ["/rules", "/adversaries", "/loot"]

const desktopTriggerClass =
  "gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-transparent transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[active=true]:bg-gold/10 data-[active=true]:text-gold data-[active=true]:border-gold/30"

export function TabsHeader({ tabs, role }: TabsHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()

  const isPcActive = pcHrefs.includes(pathname)
  const isGmActive = gmHrefs.includes(pathname)

  return (
    <div className="shrink-0 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-3 h-11">
      <span className="font-display text-sm tracking-[0.2em] text-gold uppercase">Daggerheart</span>

      {/* Desktop: nav links in header */}
      <div className="hidden md:flex h-auto bg-transparent rounded-none border-none p-0 gap-1">
        {tabs.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center ${desktopTriggerClass}`}
            data-active={pathname === href}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {role === "DEMO" && (
          <>
            <button
              onClick={() => router.push("/chat")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-l-md text-xs font-medium border transition-colors ${
                isPcActive
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              PC
            </button>
            <button
              onClick={() => router.push("/rules")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-r-md text-xs font-medium border border-l-0 transition-colors ${
                isGmActive
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              GM
            </button>
          </>
        )}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-1"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
