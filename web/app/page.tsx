import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const { getToken } = await auth()
  const token = await getToken()
  const { role } = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/users/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: ["user-role"] },
    }
  ).then((r) => r.json()) as { role: "GM" | "PC" | "DEMO" }

  redirect(role === "GM" ? "/rules" : "/chat")
}
