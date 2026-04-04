"use client"

import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { apiFetch } from "@/lib/srd/api-client"

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
  'hpMarked', 'stressMarked', 'hope',
  'goldHandfuls', 'goldBags', 'goldChests',
  'armorMarked',
  'agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge',
  'notes',
])

export function useUpdateCharacter(characterId: string | null) {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (patch: CharacterPatch) => {
      if (!characterId) throw new Error('characterId is required')
      const token = await getToken()
      await apiFetch(`/characters/${characterId}`, token, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
    },
    onError: (error: unknown) => {
      console.error("Failed to update character:", error)
    },
  })
}
