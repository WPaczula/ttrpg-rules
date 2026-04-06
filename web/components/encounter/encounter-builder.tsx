"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import {
  type Adversary,
  type Encounter,
  calculateBudget,
  calculateSpent,
  getPointCost,
} from "@/lib/adversary-types"
import { Counter } from "@/components/character-sheet/primitives"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Music } from "lucide-react"

interface EncounterBuilderProps {
  encounters: Encounter[]
  activeEncounter: Encounter | null
  library: Adversary[]
  onAddEncounter: (name: string) => void
  onDeleteEncounter: (id: string) => void
  onSelectEncounter: (id: string) => void
  onUpdateEncounter: (id: string, patch: Partial<Encounter>) => void
  onAddAdversary: (encounterId: string, name: string) => void
}

export function EncounterBuilder({
  encounters,
  activeEncounter,
  library,
  onAddEncounter,
  onDeleteEncounter,
  onSelectEncounter,
  onUpdateEncounter,
  onAddAdversary,
}: EncounterBuilderProps) {
  const budget = activeEncounter ? calculateBudget(activeEncounter.pcCount) : 0
  const spent = activeEncounter ? calculateSpent(activeEncounter, library) : 0
  const remaining = budget - spent
  const isOverBudget = remaining < 0

  const encounterItems = useMemo<ComboboxItem[]>(
    () =>
      encounters.map((e) => ({
        value: e.id,
        label: e.name,
        detail: `${e.adversaries.length} adversaries`,
      })),
    [encounters]
  )

  const adversaryItems = useMemo<ComboboxItem[]>(
    () =>
      library.map((a) => ({
        value: a.name,
        label: a.name,
        detail: `T${a.tier} ${a.type} · Diff ${a.difficulty} · ${getPointCost(a.type)}pt`,
        group: `Tier ${a.tier}`,
      })),
    [library]
  )

  return (
    <div className="space-y-4">
      {/* Encounter selector */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          {encounters.length > 0 ? (
            <Combobox
              items={encounterItems}
              value={activeEncounter?.id ?? ""}
              onSelect={(id) => { if (id) onSelectEncounter(id) }}
              placeholder="Select encounter..."
              searchPlaceholder="Search encounters..."
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">No encounters yet</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddEncounter(`Encounter ${encounters.length + 1}`)}
          className="border-border text-gold hover:bg-gold/10 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
        {activeEncounter && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteEncounter(activeEncounter.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Delete encounter"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {activeEncounter && (
        <>
          {/* Encounter name */}
          <Input
            value={activeEncounter.name}
            onChange={(e) =>
              onUpdateEncounter(activeEncounter.id, { name: e.target.value })
            }
            placeholder="Encounter name..."
            className="h-8 bg-input border-border text-sm"
          />

          {/* Music URL */}
          <div className="flex items-center gap-2">
            <Input
              value={activeEncounter.musicUrl ?? ""}
              onChange={(e) =>
                onUpdateEncounter(activeEncounter.id, { musicUrl: e.target.value || undefined })
              }
              placeholder="Music URL (opens in new tab)..."
              className="h-8 bg-input border-border text-sm flex-1"
            />
            {activeEncounter.musicUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gold hover:bg-gold/10 shrink-0"
                aria-label="Open music in new tab"
                onClick={() => window.open(activeEncounter.musicUrl!, "_blank", "noopener,noreferrer")}
              >
                <Music className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* PC Count + Budget */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">PCs</span>
              <Counter
                value={activeEncounter.pcCount}
                onChange={(v) =>
                  onUpdateEncounter(activeEncounter.id, { pcCount: v })
                }
                min={1}
                max={10}
                label="PC Count"
                size="sm"
              />
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Battle Points
              </div>
              <div
                className={cn(
                  "text-lg font-bold tabular-nums",
                  isOverBudget ? "text-destructive" : remaining <= 2 ? "text-amber-400" : "text-gold"
                )}
              >
                {spent} / {budget}
              </div>
              {isOverBudget && (
                <div className="text-[10px] text-destructive">
                  {Math.abs(remaining)} over budget
                </div>
              )}
            </div>
          </div>

          {/* Budget bar */}
          <div className="h-2 rounded-full bg-input overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isOverBudget ? "bg-destructive" : remaining <= 2 ? "bg-amber-400" : "bg-gold"
              )}
              style={{ width: `${Math.min(100, (spent / budget) * 100)}%` }}
            />
          </div>

          {/* Add adversary */}
          {library.length > 0 && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Add Adversary
              </span>
              <Combobox
                items={adversaryItems}
                value=""
                onSelect={(name) => {
                  if (name) onAddAdversary(activeEncounter.id, name)
                }}
                placeholder="Search adversary to add..."
                searchPlaceholder="Type to search..."
                emptyMessage="No adversaries found. Import some first."
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
