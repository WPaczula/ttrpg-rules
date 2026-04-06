import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { PCLayout } from "./PCLayout"

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
    <PCLayout role={role}>{children}</PCLayout>
  )
}
