import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { GMLayout } from "./GMLayout"

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
    <GMLayout role={role}>{children}</GMLayout>
  )
}
