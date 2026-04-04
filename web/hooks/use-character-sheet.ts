"use client"

import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { CharacterData, DEFAULT_CHARACTER } from "@/lib/character-types"
import { canSync, syncCharacterToApi } from "@/lib/sync/character-sync"
import { apiFetch } from "@/lib/srd/api-client"

const STORAGE_KEY = "daggerheart-character-sheet"

export interface CharacterPatch {
  hpMarked?: number
  stressMarked?: number
  hope?: number
  goldHandfuls?: number
  goldBags?: number
  goldChests?: number
  armorMarked?: number
  agility?: number
  strength?: number
  finesse?: number
  instinct?: number
  presence?: number
  knowledge?: number
  notes?: string
}

export const PATCH_FIELDS = new Set<string>([
  "hpMarked", "stressMarked", "hope",
  "goldHandfuls", "goldBags", "goldChests",
  "armorMarked",
  "agility", "strength", "finesse", "instinct", "presence", "knowledge",
  "notes",
])

interface ServerCharacterResponse {
  id: string
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

interface CharacterQueryData {
  character: CharacterData
  id: string
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
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  const { data, isLoading } = useQuery<CharacterQueryData | null>({
    queryKey: ["character"],
    queryFn: async () => {
      const token = await getToken()

      // One-time localStorage migration: sync existing data to server then clear
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          delete parsed.minorThreshold
          delete parsed.majorThreshold
          delete parsed.severeThreshold
          delete parsed._id
          const migrationData: CharacterData = { ...DEFAULT_CHARACTER, ...parsed }
          if (canSync(migrationData)) {
            await syncCharacterToApi(migrationData, token)
          }
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        // Migration failure must not block loading
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
      }

      const res = await apiFetch<ServerCharacterResponse | null>("/characters/me", token)
      if (!res) return null
      return { character: serverResponseToCharacterData(res), id: res.id }
    },
    staleTime: Infinity,
    retry: false,
  })

  const character = data?.character ?? DEFAULT_CHARACTER
  const characterId = data?.id ?? null

  const patchMutation = useMutation<
    void,
    Error,
    { id: string; patch: Partial<CharacterPatch>; next: CharacterData },
    { previous: CharacterQueryData | null | undefined }
  >({
    mutationFn: async ({ id, patch }) => {
      const token = await getToken()
      await apiFetch(`/characters/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
    },
    onMutate: async ({ next }) => {
      await queryClient.cancelQueries({ queryKey: ["character"] })
      const previous = queryClient.getQueryData<CharacterQueryData | null>(["character"])
      queryClient.setQueryData<CharacterQueryData | null>(["character"], (old) =>
        old ? { ...old, character: next } : null,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["character"], context.previous)
      }
    },
  })

  const syncMutation = useMutation<
    void,
    Error,
    { next: CharacterData },
    { previous: CharacterQueryData | null | undefined }
  >({
    mutationFn: async ({ next }) => {
      const token = await getToken()
      await syncCharacterToApi(next, token)
    },
    onMutate: async ({ next }) => {
      await queryClient.cancelQueries({ queryKey: ["character"] })
      const previous = queryClient.getQueryData<CharacterQueryData | null>(["character"])
      queryClient.setQueryData<CharacterQueryData | null>(["character"], (old) =>
        old ? { ...old, character: next } : null,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["character"], context.previous)
      }
    },
  })

  const patchMutate = patchMutation.mutate
  const syncMutate = syncMutation.mutate

  const setCharacter = useCallback(
    (updater: CharacterData | ((prev: CharacterData) => CharacterData)) => {
      const current = queryClient.getQueryData<CharacterQueryData | null>(["character"])
      const prev = current?.character ?? DEFAULT_CHARACTER
      const next = typeof updater === "function" ? updater(prev) : updater

      const changedKeys = (Object.keys(next) as (keyof CharacterData)[]).filter(
        (key) => prev[key] !== next[key],
      )
      const allPatchable =
        changedKeys.length > 0 &&
        changedKeys.every((k) => PATCH_FIELDS.has(k))

      const id = current?.id ?? null

      if (allPatchable && id) {
        const patch: Partial<CharacterPatch> = {}
        for (const key of changedKeys) {
          ;(patch as Record<string, unknown>)[key] = next[key as keyof CharacterData]
        }
        patchMutate({ id, patch, next })
      } else {
        syncMutate({ next })
      }
    },
    [queryClient, patchMutate, syncMutate],
  )

  const resetCharacter = useCallback(() => {
    // Reset local cache only — server data is preserved until user recreates a character
    queryClient.setQueryData<CharacterQueryData | null>(["character"], (old) =>
      old ? { ...old, character: DEFAULT_CHARACTER } : null,
    )
  }, [queryClient])

  return {
    character,
    characterId,
    setCharacter,
    resetCharacter,
    isLoaded: !isLoading,
  }
}
