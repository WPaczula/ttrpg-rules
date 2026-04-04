"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { type ComboboxItem } from "@/components/ui/combobox"
import { apiFetch } from "./api-client"
import { srdIdCache } from "./srd-id-cache"
import type { ApiWeapon } from "./types"

export function useSrdWeapons(playerTier: number) {
  const { getToken } = useAuth()

  const query = useQuery<ApiWeapon[]>({
    queryKey: ["srd", "weapons"],
    queryFn: async () => {
      const token = await getToken()
      const data = await apiFetch<ApiWeapon[]>("/srd/weapons", token)
      data.forEach((w) => {
        srdIdCache.weaponByName.set(w.name, { id: w.id })
      })
      return data
    },
  })

  const all = query.data ?? []

  const primaryItems: ComboboxItem[] = all
    .filter((w) => w.type === "Primary" && w.tier <= playerTier)
    .map((w) => ({
      value: w.name,
      label: w.name,
      detail: `${w.damage} · ${w.trait} · ${w.range} · ${w.burden}`,
      group: w.damageType,
    }))

  const secondaryItems: ComboboxItem[] = all
    .filter((w) => w.type === "Secondary" && w.tier <= playerTier)
    .map((w) => ({
      value: w.name,
      label: w.name,
      detail: `${w.damage} · ${w.trait} · ${w.range} · ${w.burden}`,
      group: w.damageType,
    }))

  return { primaryItems, secondaryItems, data: all, isLoading: query.isLoading }
}
