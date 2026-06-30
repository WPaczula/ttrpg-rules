"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import {
  type AdversaryStore,
  type Adversary,
  type Encounter,
  type EncounterAdversary,
  createEncounter,
} from "@/lib/adversary-types"
import {
  type AdversaryStoreDto,
  fetchAdversaryStore,
  syncAdversaryStoreToApi,
} from "@/lib/adversary-sync"

const STORAGE_KEY = "daggerheart-adversaries"
const QUERY_KEY = ["adversary-store"] as const
const SERVER_DEFAULT: AdversaryStoreDto = { library: [], encounters: [] }

export function useAdversaryStore() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Active encounter selection is device-local — never synced to the server.
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<AdversaryStoreDto>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const token = await getToken()

      // One-time localStorage migration: push existing data to the server, clear it.
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          const migration: AdversaryStoreDto = {
            library: Array.isArray(parsed.library) ? parsed.library : [],
            encounters: Array.isArray(parsed.encounters) ? parsed.encounters : [],
          }
          if (migration.library.length > 0 || migration.encounters.length > 0) {
            await syncAdversaryStoreToApi(migration, token)
          }
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        // Migration failure must not block loading.
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
      }

      return fetchAdversaryStore(token)
    },
    staleTime: Infinity,
    retry: false,
  })

  const serverStore = data ?? SERVER_DEFAULT

  // Default the active encounter to the first one; keep a still-valid selection.
  useEffect(() => {
    if (!data) return
    setActiveEncounterId((cur) =>
      cur && data.encounters.some((e) => e.id === cur)
        ? cur
        : (data.encounters[0]?.id ?? null)
    )
  }, [data])

  const syncMutation = useMutation<void, Error, AdversaryStoreDto>({
    mutationFn: async (next) => {
      const token = await getToken()
      await syncAdversaryStoreToApi(next, token)
    },
    onError: () => {
      // Re-pull the server truth if a sync fails so the UI doesn't drift.
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  // Optimistically update the cache and debounce the full-store PUT.
  const setServerStore = useCallback(
    (updater: (prev: AdversaryStoreDto) => AdversaryStoreDto) => {
      const prev =
        queryClient.getQueryData<AdversaryStoreDto>(QUERY_KEY) ?? SERVER_DEFAULT
      const next = updater(prev)
      queryClient.setQueryData<AdversaryStoreDto>(QUERY_KEY, next)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        syncMutation.mutate(next)
      }, 500)
    },
    [queryClient, syncMutation]
  )

  // ─── Library Operations ──────────────────────────────────────────────

  const importAdversaries = useCallback(
    (adversaries: Adversary[]) => {
      setServerStore((prev) => {
        const lib = [...prev.library]
        for (const adv of adversaries) {
          const idx = lib.findIndex((a) => a.name === adv.name)
          if (idx >= 0) lib[idx] = adv
          else lib.push(adv)
        }
        return { ...prev, library: lib }
      })
    },
    [setServerStore]
  )

  const removeFromLibrary = useCallback(
    (name: string) => {
      setServerStore((prev) => ({
        ...prev,
        library: prev.library.filter((a) => a.name !== name),
      }))
    },
    [setServerStore]
  )

  const clearLibrary = useCallback(() => {
    setServerStore((prev) => ({ ...prev, library: [] }))
  }, [setServerStore])

  // ─── Encounter Operations ────────────────────────────────────────────

  const addEncounter = useCallback(
    (name: string): string => {
      const enc = createEncounter(name)
      setServerStore((prev) => ({
        ...prev,
        encounters: [...prev.encounters, enc],
      }))
      setActiveEncounterId(enc.id)
      return enc.id
    },
    [setServerStore]
  )

  const deleteEncounter = useCallback(
    (id: string) => {
      setServerStore((prev) => ({
        ...prev,
        encounters: prev.encounters.filter((e) => e.id !== id),
      }))
      setActiveEncounterId((cur) => {
        if (cur !== id) return cur
        const encs =
          queryClient.getQueryData<AdversaryStoreDto>(QUERY_KEY)?.encounters ?? []
        return encs[0]?.id ?? null
      })
    },
    [setServerStore, queryClient]
  )

  const setActiveEncounter = useCallback((id: string) => {
    setActiveEncounterId(id)
  }, [])

  const updateEncounter = useCallback(
    (id: string, patch: Partial<Encounter>) => {
      setServerStore((prev) => ({
        ...prev,
        encounters: prev.encounters.map((e) =>
          e.id === id ? { ...e, ...patch } : e
        ),
      }))
    },
    [setServerStore]
  )

  const addToEncounter = useCallback(
    (encounterId: string, adversaryName: string) => {
      setServerStore((prev) => ({
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
    [setServerStore]
  )

  const removeFromEncounter = useCallback(
    (encounterId: string, instanceId: string) => {
      setServerStore((prev) => ({
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
    [setServerStore]
  )

  const updateAdversaryInstance = useCallback(
    (
      encounterId: string,
      instanceId: string,
      patch: Partial<EncounterAdversary>
    ) => {
      setServerStore((prev) => ({
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
    [setServerStore]
  )

  const store: AdversaryStore = {
    library: serverStore.library,
    encounters: serverStore.encounters,
    activeEncounterId,
  }

  const activeEncounter =
    serverStore.encounters.find((e) => e.id === activeEncounterId) ?? null

  return {
    store,
    isLoaded: !isLoading,
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
