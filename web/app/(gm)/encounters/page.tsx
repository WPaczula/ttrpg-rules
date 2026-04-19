"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAdversaryStore } from "@/hooks/use-adversary-store"
import { Section } from "@/components/character-sheet/primitives"
import { AdversaryLibrary } from "@/components/encounter/adversary-library"
import { AdversaryCard } from "@/components/encounter/adversary-card"
import { EncounterBuilder } from "@/components/encounter/encounter-builder"
import { BookOpen, Swords, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EncountersPage() {
  const {
    store,
    isLoaded,
    removeFromLibrary,
    clearLibrary,
    activeEncounter,
    addEncounter,
    deleteEncounter,
    setActiveEncounter,
    updateEncounter,
    addToEncounter,
    removeFromEncounter,
    updateAdversaryInstance,
  } = useAdversaryStore()

  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearLibrary = useCallback(() => {
    if (confirmClear) {
      clearLibrary()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }, [confirmClear, clearLibrary])

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="py-4 space-y-2">
          <h1 className="font-display text-[28px] leading-none font-semibold tracking-wide text-gold flex items-center gap-3">
            <Swords className="w-6 h-6 shrink-0" />
            Encounters
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your adversary library, build encounters, and track combat.
          </p>
        </div>
        <Separator className="bg-border mb-1" />

        {/* Library section */}
        <Section icon={<BookOpen className="w-4 h-4" />} title="Adversary Library" defaultOpen={store.library.length === 0}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {store.library.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLibrary}
                  className={cn(
                    "text-xs",
                    confirmClear
                      ? "text-destructive hover:text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  )}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {confirmClear ? "Confirm clear?" : "Clear All"}
                </Button>
              )}
              <span className="dh-feat-group-label ml-auto !mb-0">
                {store.library.length} adversar{store.library.length === 1 ? "y" : "ies"}
              </span>
            </div>
            <AdversaryLibrary
              library={store.library}
              onAdd={(name) => {
                if (activeEncounter) {
                  addToEncounter(activeEncounter.id, name)
                }
              }}
              onRemove={removeFromLibrary}
              hasActiveEncounter={!!activeEncounter}
            />
          </div>
        </Section>

        {/* Encounter Builder section */}
        <Section icon={<Swords className="w-4 h-4" />} title="Encounter Builder" defaultOpen>
          <EncounterBuilder
            encounters={store.encounters}
            activeEncounter={activeEncounter}
            library={store.library}
            onAddEncounter={addEncounter}
            onDeleteEncounter={deleteEncounter}
            onSelectEncounter={setActiveEncounter}
            onUpdateEncounter={updateEncounter}
            onAddAdversary={addToEncounter}
          />
        </Section>

        {/* Active Encounter Cards */}
        {activeEncounter && activeEncounter.adversaries.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="dh-feat-group-label px-1 !mb-0">
              Active Encounter — {activeEncounter.adversaries.length} adversar{activeEncounter.adversaries.length === 1 ? "y" : "ies"}
            </div>
            {activeEncounter.adversaries.map((inst) => {
              const adv = store.library.find((a) => a.name === inst.adversaryName)
              if (!adv) return null
              return (
                <AdversaryCard
                  key={inst.id}
                  instance={inst}
                  adversary={adv}
                  onUpdateHp={(hp) =>
                    updateAdversaryInstance(activeEncounter.id, inst.id, { hpMarked: hp })
                  }
                  onUpdateStress={(stress) =>
                    updateAdversaryInstance(activeEncounter.id, inst.id, { stressMarked: stress })
                  }
                  onRemove={() => removeFromEncounter(activeEncounter.id, inst.id)}
                />
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {activeEncounter && activeEncounter.adversaries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No adversaries in this encounter yet.</p>
            <p className="text-xs mt-1">
              {store.library.length === 0
                ? "Use the Adversaries tab to create adversaries, then add them here."
                : "Use the library or the dropdown above to add adversaries."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
