"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAdversaryStore } from "@/hooks/use-adversary-store"
import { Section } from "@/components/character-sheet/primitives"
import { AdversaryImport } from "@/components/encounter/adversary-import"
import { AdversaryLibrary } from "@/components/encounter/adversary-library"
import { AdversaryCard } from "@/components/encounter/adversary-card"
import { EncounterBuilder } from "@/components/encounter/encounter-builder"
import { AdversaryChat } from "@/components/encounter/adversary-chat"
import type { Adversary } from "@/lib/adversary-types"
import { BookOpen, Swords, Upload, RotateCcw, Bot, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function EncounterTab() {
  const {
    store,
    isLoaded,
    importAdversaries,
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

  const [importOpen, setImportOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [subTab, setSubTab] = useState("builder")

  const handleAcceptEncounter = useCallback((name: string, adversaries: Adversary[]) => {
    // 1. Import adversaries to library
    importAdversaries(adversaries)
    // 2. Create encounter and get its ID
    const encounterId = addEncounter(name)
    // 3. Add each adversary instance to the encounter
    for (const adv of adversaries) {
      addToEncounter(encounterId, adv.name)
    }
    // 4. Switch to encounters sub-tab so user sees the result
    setSubTab("encounters")
  }, [importAdversaries, addEncounter, addToEncounter])

  const handleAddAdversary = useCallback((adversary: Adversary) => {
    // 1. Import to library (required as source for encounter instances)
    importAdversaries([adversary])
    // 2. Use active encounter or create a new one
    const encId = store.activeEncounterId ?? addEncounter("New Encounter")
    // 3. Add instance to the encounter
    addToEncounter(encId, adversary.name)
    // 4. Switch to encounters sub-tab so user sees the result
    setSubTab("encounters")
  }, [store.activeEncounterId, importAdversaries, addEncounter, addToEncounter])

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  const handleClearLibrary = () => {
    if (confirmClear) {
      clearLibrary()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  return (
    <Tabs value={subTab} onValueChange={setSubTab} className="flex flex-col h-full gap-0">
      <TabsList className="shrink-0 w-full rounded-none border-b border-border bg-card/60 backdrop-blur-sm h-10 justify-start gap-1 px-2 p-1">
        <TabsTrigger
          value="builder"
          className="gap-1.5 text-xs data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30"
        >
          <Bot className="w-3.5 h-3.5" />
          AI Builder
        </TabsTrigger>
        <TabsTrigger
          value="encounters"
          className="gap-1.5 text-xs data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30"
        >
          <Shield className="w-3.5 h-3.5" />
          Encounters
        </TabsTrigger>
      </TabsList>

      {/* AI Builder sub-tab */}
      <TabsContent value="builder" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
        <AdversaryChat
          isActive={subTab === "builder"}
          onAcceptEncounter={handleAcceptEncounter}
          onAddAdversary={handleAddAdversary}
        />
      </TabsContent>

      {/* Encounters sub-tab */}
      <TabsContent value="encounters" className="flex-1 min-h-0 mt-0 overflow-y-auto data-[state=inactive]:hidden">
        <div className="max-w-2xl mx-auto px-4 pb-8">
          {/* Header */}
          <div className="py-4 space-y-1">
            <h1 className="text-lg font-semibold text-gold flex items-center gap-2">
              <Swords className="w-5 h-5" />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportOpen(true)}
                  className="border-border text-gold hover:bg-gold/10"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Import JSON
                </Button>
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
                <span className="text-[10px] text-muted-foreground ml-auto">
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

          {/* Import dialog */}
          <AdversaryImport
            open={importOpen}
            onOpenChange={setImportOpen}
            onImport={importAdversaries}
          />

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
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1">
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
                      updateAdversaryInstance(activeEncounter.id, inst.id, {
                        hpMarked: hp,
                      })
                    }
                    onUpdateStress={(stress) =>
                      updateAdversaryInstance(activeEncounter.id, inst.id, {
                        stressMarked: stress,
                      })
                    }
                    onRemove={() =>
                      removeFromEncounter(activeEncounter.id, inst.id)
                    }
                  />
                )
              })}
            </div>
          )}

          {/* Empty state for encounter */}
          {activeEncounter && activeEncounter.adversaries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Swords className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No adversaries in this encounter yet.</p>
              <p className="text-xs mt-1">
                {store.library.length === 0
                  ? "Import some adversaries first, then add them here."
                  : "Use the library or the dropdown above to add adversaries."}
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
