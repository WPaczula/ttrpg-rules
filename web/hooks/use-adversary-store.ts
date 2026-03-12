"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  type AdversaryStore,
  type Adversary,
  type Encounter,
  type EncounterAdversary,
  DEFAULT_STORE,
  createEncounter,
} from "@/lib/adversary-types"

const STORAGE_KEY = "daggerheart-adversaries"

export function useAdversaryStore() {
  const [store, setStoreState] = useState<AdversaryStore>(DEFAULT_STORE)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setStoreState({ ...DEFAULT_STORE, ...parsed })
      }
    } catch {
      // Invalid data, use defaults
    }
    setIsLoaded(true)
  }, [])

  const setStore = useCallback(
    (updater: AdversaryStore | ((prev: AdversaryStore) => AdversaryStore)) => {
      setStoreState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
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

  // ─── Library Operations ──────────────────────────────────────────────

  const importAdversaries = useCallback(
    (adversaries: Adversary[]) => {
      setStore((prev) => {
        const lib = [...prev.library]
        for (const adv of adversaries) {
          const idx = lib.findIndex((a) => a.name === adv.name)
          if (idx >= 0) {
            lib[idx] = adv // Update existing
          } else {
            lib.push(adv)
          }
        }
        return { ...prev, library: lib }
      })
    },
    [setStore]
  )

  const removeFromLibrary = useCallback(
    (name: string) => {
      setStore((prev) => ({
        ...prev,
        library: prev.library.filter((a) => a.name !== name),
      }))
    },
    [setStore]
  )

  const clearLibrary = useCallback(() => {
    setStore((prev) => ({ ...prev, library: [] }))
  }, [setStore])

  // ─── Encounter Operations ────────────────────────────────────────────

  const addEncounter = useCallback(
    (name: string): string => {
      const enc = createEncounter(name)
      setStore((prev) => ({
        ...prev,
        encounters: [...prev.encounters, enc],
        activeEncounterId: enc.id,
      }))
      return enc.id
    },
    [setStore]
  )

  const deleteEncounter = useCallback(
    (id: string) => {
      setStore((prev) => {
        const encounters = prev.encounters.filter((e) => e.id !== id)
        const activeEncounterId =
          prev.activeEncounterId === id
            ? encounters[0]?.id ?? null
            : prev.activeEncounterId
        return { ...prev, encounters, activeEncounterId }
      })
    },
    [setStore]
  )

  const setActiveEncounter = useCallback(
    (id: string) => {
      setStore((prev) => ({ ...prev, activeEncounterId: id }))
    },
    [setStore]
  )

  const updateEncounter = useCallback(
    (id: string, patch: Partial<Encounter>) => {
      setStore((prev) => ({
        ...prev,
        encounters: prev.encounters.map((e) =>
          e.id === id ? { ...e, ...patch } : e
        ),
      }))
    },
    [setStore]
  )

  const addToEncounter = useCallback(
    (encounterId: string, adversaryName: string) => {
      setStore((prev) => ({
        ...prev,
        encounters: prev.encounters.map((e) =>
          e.id === encounterId
            ? {
                ...e,
                adversaries: [
                  ...e.adversaries,
                  {
                    id: crypto.randomUUID(),
                    adversaryName,
                    hpMarked: 0,
                    stressMarked: 0,
                  } satisfies EncounterAdversary,
                ],
              }
            : e
        ),
      }))
    },
    [setStore]
  )

  const removeFromEncounter = useCallback(
    (encounterId: string, instanceId: string) => {
      setStore((prev) => ({
        ...prev,
        encounters: prev.encounters.map((e) =>
          e.id === encounterId
            ? {
                ...e,
                adversaries: e.adversaries.filter((a) => a.id !== instanceId),
              }
            : e
        ),
      }))
    },
    [setStore]
  )

  const updateAdversaryInstance = useCallback(
    (
      encounterId: string,
      instanceId: string,
      patch: Partial<EncounterAdversary>
    ) => {
      setStore((prev) => ({
        ...prev,
        encounters: prev.encounters.map((e) =>
          e.id === encounterId
            ? {
                ...e,
                adversaries: e.adversaries.map((a) =>
                  a.id === instanceId ? { ...a, ...patch } : a
                ),
              }
            : e
        ),
      }))
    },
    [setStore]
  )

  const activeEncounter = store.encounters.find(
    (e) => e.id === store.activeEncounterId
  ) ?? null

  return {
    store,
    isLoaded,
    // Library
    importAdversaries,
    removeFromLibrary,
    clearLibrary,
    // Encounters
    activeEncounter,
    addEncounter,
    deleteEncounter,
    setActiveEncounter,
    updateEncounter,
    addToEncounter,
    removeFromEncounter,
    updateAdversaryInstance,
  }
}
