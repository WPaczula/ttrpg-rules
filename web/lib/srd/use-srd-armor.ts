"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { type ComboboxItem } from "@/components/ui/combobox"
import { apiFetch } from "./api-client"
import { srdIdCache } from "./srd-id-cache"
import type { ApiArmor } from "./types"

export function useSrdArmor(playerTier: number) {
  const { getToken } = useAuth()

  const query = useQuery<ApiArmor[]>({
    queryKey: ["srd", "armor"],
    queryFn: async () => {
      const token = await getToken()
      const data = await apiFetch<ApiArmor[]>("/srd/armor", token)
      data.forEach((a) => {
        srdIdCache.armorByName.set(a.name, { id: a.id })
      })
      return data
    },
  })

  const items: ComboboxItem[] = (query.data ?? [])
    .filter((a) => a.tier <= playerTier)
    .map((a) => ({
      value: a.name,
      label: a.name,
      detail: `Score ${a.baseScore} · Thresholds ${a.baseThresholds}${a.feature ? ` · ${a.feature}` : ""}`,
      group: `Tier ${a.tier}`,
    }))

  return { items, data: query.data ?? [], isLoading: query.isLoading }
}
