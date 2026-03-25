"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CharacterData, DEFAULT_CHARACTER } from "@/lib/character-types"

const STORAGE_KEY = "daggerheart-character-sheet"

export function useCharacterSheet() {
  const [character, setCharacterState] = useState<CharacterData>(DEFAULT_CHARACTER)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savePausedRef = useRef(false)
  const snapshotRef = useRef<CharacterData | null>(null)

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Migration: strip old threshold fields (now computed on the fly)
        delete parsed.minorThreshold
        delete parsed.majorThreshold
        delete parsed.severeThreshold
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
        // Skip localStorage save when paused (edit mode)
        if (!savePausedRef.current) {
          // Debounce saves to avoid thrashing localStorage on rapid changes
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          saveTimerRef.current = setTimeout(() => {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            } catch {
              // Storage full or unavailable
            }
          }, 500)
        }
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

  /** Pause auto-save to localStorage (for edit mode) */
  const pauseSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    savePausedRef.current = true
  }, [])

  /** Resume auto-save to localStorage */
  const resumeSave = useCallback(() => {
    savePausedRef.current = false
  }, [])

  /** Take a snapshot of the current character state */
  const takeSnapshot = useCallback(() => {
    setCharacterState((current) => {
      snapshotRef.current = structuredClone(current)
      return current
    })
  }, [])

  /** Restore the previously taken snapshot and flush to localStorage */
  const restoreSnapshot = useCallback(() => {
    if (snapshotRef.current) {
      const snapshot = snapshotRef.current
      snapshotRef.current = null
      setCharacterState(snapshot)
      // Flush restored state to localStorage so it persists on refresh
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      } catch {
        // Storage full or unavailable
      }
    }
  }, [])

  /** Flush current state to localStorage immediately */
  const flushToStorage = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setCharacterState((current) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      } catch {
        // Storage full or unavailable
      }
      return current
    })
    snapshotRef.current = null
  }, [])

  return {
    character,
    setCharacter,
    resetCharacter,
    isLoaded,
    pauseSave,
    resumeSave,
    takeSnapshot,
    restoreSnapshot,
    flushToStorage,
  }
}
