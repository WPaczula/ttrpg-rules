"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { CharacterData, DEFAULT_CHARACTER } from "@/lib/character-types"
import { useSync } from "@/hooks/use-sync"
import { apiFetch } from "@/lib/srd/api-client"

const STORAGE_KEY = "daggerheart-character-sheet"

interface ServerCharacterResponse {
  class: { name: string }
  subclass: { name: string }
  ancestry: { name: string }
  secondaryAncestry: { name: string } | null
  ancestryFeature: { name: string }
  secondaryAncestryFeature: { name: string } | null
  community: { name: string }
  armor: { name: string } | null
  primaryWeapon: { name: string } | null
  secondaryWeapon: { name: string } | null
  markedTraits: { trait: string }[]
  experiences: { id: string; name: string; modifier: number }[]
  domainCards: { id: string; domainCard: { id: string; name: string; level: number; domainName: string } }[]
  name: string
  level: number
  agility: number
  strength: number
  finesse: number
  instinct: number
  presence: number
  knowledge: number
  hpTotal: number
  hpMarked: number
  stressTotal: number
  stressMarked: number
  evasion: number
  armorMarked: number
  hope: number
  goldHandfuls: number
  goldBags: number
  goldChests: number
  proficiency: number
  notes: string
  items: string[]
}

function serverResponseToCharacterData(res: ServerCharacterResponse): CharacterData {
  return {
    ...DEFAULT_CHARACTER,
    name: res.name,
    level: res.level,
    class: res.class.name,
    subclass: res.subclass.name,
    ancestry: res.ancestry.name,
    secondaryAncestry: res.secondaryAncestry?.name ?? "",
    ancestryFeature: res.ancestryFeature.name,
    secondaryAncestryFeature: res.secondaryAncestryFeature?.name ?? "",
    community: res.community.name,
    agility: res.agility,
    strength: res.strength,
    finesse: res.finesse,
    instinct: res.instinct,
    presence: res.presence,
    knowledge: res.knowledge,
    hpTotal: res.hpTotal,
    hpMarked: res.hpMarked,
    stressTotal: res.stressTotal,
    stressMarked: res.stressMarked,
    evasion: res.evasion,
    armorMarked: res.armorMarked,
    hope: res.hope,
    goldHandfuls: res.goldHandfuls,
    goldBags: res.goldBags,
    goldChests: res.goldChests,
    proficiency: res.proficiency,
    primaryWeapon: res.primaryWeapon?.name ?? "",
    secondaryWeapon: res.secondaryWeapon?.name ?? "",
    armorName: res.armor?.name ?? "",
    markedTraits: res.markedTraits.map((t) => t.trait),
    experiences: res.experiences.map((e) => ({ id: e.id, name: e.name, modifier: e.modifier })),
    domainCards: res.domainCards.map((dc) => ({
      id: dc.id,
      name: dc.domainCard.name,
      level: dc.domainCard.level,
      domain: dc.domainCard.domainName,
    })),
    notes: res.notes,
    items: res.items,
  }
}

export function useCharacterSheet() {
  const [character, setCharacterState] = useState<CharacterData>(DEFAULT_CHARACTER)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savePausedRef = useRef(false)
  const snapshotRef = useRef<CharacterData | null>(null)
  const { syncCharacter } = useSync()
  const { getToken } = useAuth()

  useEffect(() => {
    let cancelled = false

    async function load() {
      let loaded: CharacterData | null = null

      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          delete parsed.minorThreshold
          delete parsed.majorThreshold
          delete parsed.severeThreshold
          loaded = { ...DEFAULT_CHARACTER, ...parsed }
        }
      } catch {
        // Invalid localStorage data, will fall through to server load
      }

      if (loaded) {
        if (!cancelled) {
          setCharacterState(loaded)
          setIsLoaded(true)
        }
        return
      }

      // No localStorage data — try fetching from server
      try {
        const token = await getToken()
        if (token) {
          const res = await apiFetch<ServerCharacterResponse | null>(
            "/characters/me",
            token,
          )
          if (!cancelled && res) {
            const data = serverResponseToCharacterData(res)
            setCharacterState(data)
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
            } catch {}
          }
        }
      } catch {
        // Server unavailable — stay with defaults
      }

      if (!cancelled) setIsLoaded(true)
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCharacter = useCallback(
    (updater: CharacterData | ((prev: CharacterData) => CharacterData)) => {
      setCharacterState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        if (!savePausedRef.current) {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          saveTimerRef.current = setTimeout(() => {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            } catch {}
            syncCharacter(next)
          }, 500)
        }
        return next
      })
    },
    [syncCharacter],
  )

  const resetCharacter = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHARACTER))
    } catch {}
    setCharacterState(DEFAULT_CHARACTER)
  }, [])

  const pauseSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    savePausedRef.current = true
  }, [])

  const resumeSave = useCallback(() => {
    savePausedRef.current = false
  }, [])

  const takeSnapshot = useCallback(() => {
    setCharacterState((current) => {
      snapshotRef.current = structuredClone(current)
      return current
    })
  }, [])

  const restoreSnapshot = useCallback(() => {
    if (snapshotRef.current) {
      const snapshot = snapshotRef.current
      snapshotRef.current = null
      setCharacterState(snapshot)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      } catch {}
    }
  }, [])

  const flushToStorage = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setCharacterState((current) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      } catch {}
      syncCharacter(current)
      return current
    })
    snapshotRef.current = null
  }, [syncCharacter])

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
