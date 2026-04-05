"use client"

import { ChatInterface } from "@/components/chat-interface"
import { useCharacterSheet } from "@/hooks/use-character-sheet"
import { useRouter } from "next/navigation"
import type { CharacterData } from "@/lib/character-types"

export default function ChatPage() {
  const { setCharacter } = useCharacterSheet()
  const router = useRouter()

  const handleApplyCharacter = (data: CharacterData) => {
    setCharacter(data)
    router.push("/sheet")
  }

  return <ChatInterface isActive={true} onApplyCharacter={handleApplyCharacter} />
}
