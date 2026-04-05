"use client"

import { LevelUpTab } from "@/components/level-up-tab"
import { useCharacterSheet } from "@/hooks/use-character-sheet"

export default function LevelUpPage() {
  const { character, setCharacter, isLoaded } = useCharacterSheet()

  return <LevelUpTab character={character} setCharacter={setCharacter} isLoaded={isLoaded} />
}
