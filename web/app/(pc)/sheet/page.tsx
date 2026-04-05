"use client"

import { CharacterSheetTab } from "@/components/character-sheet-tab"
import { useCharacterSheet } from "@/hooks/use-character-sheet"

export default function SheetPage() {
  const { character, setCharacter, resetCharacter, isLoaded } = useCharacterSheet()

  return (
    <CharacterSheetTab
      character={character}
      setCharacter={setCharacter}
      resetCharacter={resetCharacter}
      isLoaded={isLoaded}
    />
  )
}
