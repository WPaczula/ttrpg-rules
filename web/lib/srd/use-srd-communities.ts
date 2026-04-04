"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { type ComboboxItem } from "@/components/ui/combobox"
import { apiFetch } from "./api-client"
import { srdIdCache } from "./srd-id-cache"
import type { ApiCommunity } from "./types"

export function useSrdCommunities() {
  const { getToken } = useAuth()

  const query = useQuery<ApiCommunity[]>({
    queryKey: ["srd", "communities"],
    queryFn: async () => {
      const token = await getToken()
      const data = await apiFetch<ApiCommunity[]>("/srd/communities", token)
      data.forEach((cm) => {
        srdIdCache.communityByName.set(cm.name, { id: cm.id })
      })
      return data
    },
  })

  const items: ComboboxItem[] = (query.data ?? []).map((cm) => ({
    value: cm.name,
    label: cm.name,
    detail: cm.features.map((f) => f.name).join(", "),
  }))

  return { items, data: query.data ?? [], isLoading: query.isLoading }
}
