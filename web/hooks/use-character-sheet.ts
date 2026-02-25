"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CharacterData, DEFAULT_CHARACTER } from "@/lib/character-types"

const STORAGE_KEY = "daggerheart-character-sheet"

export function useCharacterSheet() {
  const [character, setCharacterState] = useState<CharacterData>(DEFAULT_CHARACTER)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Merge with defaults so new fields are always present
        setCharacterState({ ...DEFAULT_CHARACTER, ...parsed })
      }
    } catch {
      // Invalid data, use defaults
    }
    setIsLoaded(true)
  }, [])

  const setCharacter = useCallback(
    (updater: CharacterData | ((prev: CharacterData) => CharacterData)) => {
      setCharacterState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        // Debounce saves to avoid thrashing localStorage on rapid changes
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          } catch {
            // Storage full or unavailable
          }
        }, 500)
        return next
      })
    },
    []
  )

  const resetCharacter = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHARACTER))
    } catch {}
    setCharacterState(DEFAULT_CHARACTER)
  }, [])

  return { character, setCharacter, resetCharacter, isLoaded }
}
