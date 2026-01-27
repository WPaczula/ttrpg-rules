"use client"

import { useState } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"

export type Game = "daggerheart" | "dnd"

export default function Home() {
  const [password, setPassword] = useState<string | null>(null)
  const [game, setGame] = useState<Game>("dnd")

  if (!password) {
    return <AccessGate onValidPassword={setPassword} />
  }

  return <ChatInterface key={game} password={password} game={game} onGameChange={setGame} />
}
