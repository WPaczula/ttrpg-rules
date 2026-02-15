"use client"

import { useState } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  const [password, setPassword] = useState<string | null>(null)

  if (!password) {
    return <AccessGate onValidPassword={setPassword} />
  }

  return <ChatInterface password={password} />
}
