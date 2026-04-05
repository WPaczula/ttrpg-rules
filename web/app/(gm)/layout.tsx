import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { BookOpen, Swords, Dices } from "lucide-react"
import { TabsHeader } from "@/components/tabs-header"
import { MobileTabsNav } from "@/components/mobile-tabs-nav"

const gmTabs = [
  { value: "rules", href: "/rules", icon: BookOpen, label: "Rules" },
  { value: "adversaries", href: "/adversaries", icon: Swords, label: "Adversaries" },
  { value: "loot", href: "/loot", icon: Dices, label: "Loot" },
]

export default async function GmLayout({ children }: { children: React.ReactNode }) {
  const { getToken } = await auth()
  const token = await getToken()
  const { role } = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/users/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: ["user-role"] },
    }
  ).then((r) => r.json()) as { role: "GM" | "PC" | "DEMO" }

  if (role !== "GM" && role !== "DEMO") {
    notFound()
  }

  return (
    <div className="flex flex-col h-dvh bg-background gap-0">
      <TabsHeader tabs={gmTabs} role={role} />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      <MobileTabsNav tabs={gmTabs} />
    </div>
  )
}
