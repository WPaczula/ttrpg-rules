"use client"

import { useCallback } from "react"
import { AdversaryChat } from "@/components/encounter/adversary-chat"
import { useAdversaryStore } from "@/hooks/use-adversary-store"
import type { Adversary } from "@/lib/adversary-types"

export default function AdversariesPage() {
  const { store, importAdversaries, addEncounter, addToEncounter } = useAdversaryStore()

  const handleAcceptEncounter = useCallback(
    (name: string, adversaries: Adversary[]) => {
      importAdversaries(adversaries)
      const encounterId = addEncounter(name)
      for (const adv of adversaries) {
        addToEncounter(encounterId, adv.name)
      }
    },
    [importAdversaries, addEncounter, addToEncounter]
  )

  const handleAddAdversary = useCallback(
    (adversary: Adversary) => {
      importAdversaries([adversary])
      const encId = store.activeEncounterId ?? addEncounter("New Encounter")
      addToEncounter(encId, adversary.name)
    },
    [store.activeEncounterId, importAdversaries, addEncounter, addToEncounter]
  )

  return (
    <AdversaryChat
      isActive
      onAcceptEncounter={handleAcceptEncounter}
      onAddAdversary={handleAddAdversary}
    />
  )
}
