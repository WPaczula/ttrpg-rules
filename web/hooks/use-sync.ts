"use client"

import { useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import type { CharacterData } from "@/lib/character-types"
import { syncEngine } from "@/lib/sync/sync-engine"
import { syncCharacterToApi } from "@/lib/sync/character-sync"

export function useSync() {
  const { getToken } = useAuth()

  const syncCharacter = useCallback(
    (data: CharacterData) => {
      syncEngine.enqueue("character", async () => {
        const token = await getToken()
        await syncCharacterToApi(data, token)
      })
    },
    [getToken],
  )

  return { syncCharacter }
}
