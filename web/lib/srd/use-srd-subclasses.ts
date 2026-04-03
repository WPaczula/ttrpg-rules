"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { type ComboboxItem } from "@/components/ui/combobox"
import { srdFetch } from "./api-client"
import { srdIdCache } from "./srd-id-cache"
import type { ApiSubclass } from "./types"

export function useSrdSubclasses(filterByClassNames?: string[]) {
  const { getToken } = useAuth()

  const query = useQuery<ApiSubclass[]>({
    queryKey: ["srd", "subclasses"],
    queryFn: async () => {
      const token = await getToken()
      const data = await srdFetch<ApiSubclass[]>("/srd/subclasses", token)
      data.forEach((sc) => {
        srdIdCache.subclassByName.set(sc.name, { id: sc.id, className: sc.className })
      })
      return data
    },
  })

  const filtered = filterByClassNames && filterByClassNames.length > 0
    ? (query.data ?? []).filter((sc) => filterByClassNames.includes(sc.className))
    : (query.data ?? [])

  const items: ComboboxItem[] = filtered.map((sc) => ({
    value: sc.name,
    label: sc.name,
    detail: sc.description,
  }))

  return { items, data: query.data ?? [], isLoading: query.isLoading }
}
