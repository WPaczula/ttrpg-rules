'use client'

import { MobileTabsNav } from "@/components/mobile-tabs-nav"
import { TabsHeader } from "@/components/tabs-header"
import { BookOpen, Dices, Swords } from "lucide-react"
import React from "react"

const gmTabs = [
    { value: "rules", href: "/rules", icon: BookOpen, label: "Rules" },
    { value: "adversaries", href: "/adversaries", icon: Swords, label: "Adversaries" },
    { value: "loot", href: "/loot", icon: Dices, label: "Loot" },
]

export const GMLayout = ({ children, role }: { children: React.ReactNode, role: "GM" | 'DEMO' }) => {
    return <div className="flex flex-col h-dvh bg-background gap-0">
        <TabsHeader tabs={gmTabs} role={role} />
        <main className="flex-1 min-h-0">{children}</main>
        <MobileTabsNav tabs={gmTabs} />
    </div>
}