import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { MessageSquare, Scroll, ArrowUpCircle } from "lucide-react"
import { TabsHeader } from "@/components/tabs-header"
import { MobileTabsNav } from "@/components/mobile-tabs-nav"

const pcTabs = [
  { value: "chat", href: "/chat", icon: MessageSquare, label: "Creator" },
  { value: "sheet", href: "/sheet", icon: Scroll, label: "Sheet" },
  { value: "levelup", href: "/levelup", icon: ArrowUpCircle, label: "Lvl Up" },
]

export default async function PcLayout({ children }: { children: React.ReactNode }) {
  const { getToken } = await auth()
  const token = await getToken()
  const { role } = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/users/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: ["user-role"] },
    }
  ).then((r) => r.json()) as { role: "GM" | "PC" | "DEMO" }

  if (role !== "PC" && role !== "DEMO") {
    notFound()
  }

  return (
    <div className="flex flex-col h-dvh bg-background gap-0">
      <TabsHeader tabs={pcTabs} role={role} />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      <MobileTabsNav tabs={pcTabs} />
    </div>
  )
}
