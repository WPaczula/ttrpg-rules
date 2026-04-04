"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { type ComboboxItem } from "@/components/ui/combobox"
import { apiFetch } from "./api-client"
import { srdIdCache } from "./srd-id-cache"
import type { ApiDomainCard } from "./types"

export function useSrdDomainCards(characterLevel: number, classDomainNames?: string[]) {
  const { getToken } = useAuth()

  const query = useQuery<ApiDomainCard[]>({
    queryKey: ["srd", "domain-cards"],
    queryFn: async () => {
      const token = await getToken()
      const data = await apiFetch<ApiDomainCard[]>("/srd/domain-cards", token)
      data.forEach((dc) => {
        srdIdCache.domainCardByName.set(dc.name, { id: dc.id })
      })
      return data
    },
  })

  const items: ComboboxItem[] = (query.data ?? [])
    .filter((dc) => {
      if (dc.level > characterLevel) return false
      if (classDomainNames && classDomainNames.length > 0) {
        return classDomainNames.includes(dc.domainName)
      }
      return true
    })
    .map((dc) => ({
      value: dc.name,
      label: dc.name,
      detail: `Lvl ${dc.level} · Recall ${dc.recallCost}`,
      group: dc.domainName,
    }))

  return { items, data: query.data ?? [], isLoading: query.isLoading }
}
