"use client"

import { MobileTabsNav } from "@/components/mobile-tabs-nav";
import { TabsHeader } from "@/components/tabs-header";
import { MessageSquare, Scroll, ArrowUpCircle } from "lucide-react";

export const pcTabs = [
  { value: "chat", href: "/chat", icon: MessageSquare, label: "Creator" },
  { value: "sheet", href: "/sheet", icon: Scroll, label: "Sheet" },
  { value: "levelup", href: "/levelup", icon: ArrowUpCircle, label: "Lvl Up" },
]

export const PCLayout = ({ children, role }: { children: React.ReactNode, role: "PC" | "DEMO" }) => {
  return (
    <div className="flex flex-col h-dvh bg-background gap-0">
      <TabsHeader tabs={pcTabs} role={role} />
      <main className="flex-1 min-h-0 pb-16 md:pb-0">{children}</main>
      <MobileTabsNav tabs={pcTabs} />
    </div>
  )
}