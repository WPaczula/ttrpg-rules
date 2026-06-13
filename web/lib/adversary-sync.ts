import { apiFetch } from "@/lib/srd/api-client"
import type { Adversary, Encounter } from "@/lib/adversary-types"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

/**
 * Server-side adversary store: the GM's custom adversary library plus their
 * encounters. The device-local `activeEncounterId` is intentionally excluded —
 * selection state is not synced across devices.
 */
export interface AdversaryStoreDto {
  library: Adversary[]
  encounters: Encounter[]
}

export async function fetchAdversaryStore(
  token: string | null
): Promise<AdversaryStoreDto> {
  return apiFetch<AdversaryStoreDto>("/encounters/store", token)
}

export async function syncAdversaryStoreToApi(
  store: AdversaryStoreDto,
  token: string | null
): Promise<void> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${BASE}/encounters/store`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      library: store.library,
      encounters: store.encounters.map((e) => ({
        name: e.name,
        pcCount: e.pcCount,
        musicUrl: e.musicUrl,
        adversaries: e.adversaries.map((a) => ({
          adversaryName: a.adversaryName,
          hpMarked: a.hpMarked,
          stressMarked: a.stressMarked,
        })),
      })),
    }),
  })
  if (!res.ok) throw new Error(`Adversary store sync failed: ${res.status}`)
}
