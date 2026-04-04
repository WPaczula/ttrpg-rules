"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { type ComboboxItem } from "@/components/ui/combobox"
import { apiFetch } from "./api-client"
import { srdIdCache } from "./srd-id-cache"
import type { ApiAncestry } from "./types"

export function useSrdAncestries() {
  const { getToken } = useAuth()

  const query = useQuery<ApiAncestry[]>({
    queryKey: ["srd", "ancestries"],
    queryFn: async () => {
      const token = await getToken()
      const data = await apiFetch<ApiAncestry[]>("/srd/ancestries", token)
      data.forEach((a) => {
        srdIdCache.ancestryByName.set(a.name, { id: a.id, features: a.features })
      })
      return data
    },
  })

  const items: ComboboxItem[] = (query.data ?? []).map((a) => ({
    value: a.name,
    label: a.name,
    detail: a.features.map((f) => f.name).join(", "),
  }))

  return { items, data: query.data ?? [], isLoading: query.isLoading }
}
