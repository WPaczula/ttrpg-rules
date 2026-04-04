"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { type ComboboxItem } from "@/components/ui/combobox"
import { apiFetch } from "./api-client"
import { srdIdCache } from "./srd-id-cache"
import type { ApiClass } from "./types"

export function useSrdClasses() {
  const { getToken } = useAuth()

  const query = useQuery<ApiClass[]>({
    queryKey: ["srd", "classes"],
    queryFn: async () => {
      const token = await getToken()
      const data = await apiFetch<ApiClass[]>("/srd/classes", token)
      data.forEach((cls) => {
        srdIdCache.classByName.set(cls.name, {
          id: cls.id,
          evasion: cls.evasion,
          hp: cls.hp,
          subclassIds: cls.subclasses.map((s) => s.id),
          domainNames: cls.domains.map((d) => d.name),
        })
      })
      return data
    },
  })

  const items: ComboboxItem[] = (query.data ?? []).map((cls) => ({
    value: cls.name,
    label: cls.name,
    detail: `${cls.domains.map((d) => d.name).join(" & ")} · HP ${cls.hp} · Evasion ${cls.evasion}`,
  }))

  return { items, data: query.data ?? [], isLoading: query.isLoading }
}
