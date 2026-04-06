"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type Adversary,
  type AdversaryType,
  ADVERSARY_TYPES,
  getPointCost,
} from "@/lib/adversary-types"
import { cn } from "@/lib/utils"
import { Search, Plus, Trash2 } from "lucide-react"

interface AdversaryLibraryProps {
  library: Adversary[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
  hasActiveEncounter: boolean
}

const TYPE_COLORS: Partial<Record<AdversaryType, string>> = {
  Solo: "bg-red-900/50 text-red-300 border-red-700/50",
  Bruiser: "bg-orange-900/50 text-orange-300 border-orange-700/50",
  Leader: "bg-purple-900/50 text-purple-300 border-purple-700/50",
  Standard: "bg-blue-900/50 text-blue-300 border-blue-700/50",
  Ranged: "bg-green-900/50 text-green-300 border-green-700/50",
  Skulk: "bg-slate-800/50 text-slate-300 border-slate-600/50",
  Horde: "bg-amber-900/50 text-amber-300 border-amber-700/50",
  Minion: "bg-gray-800/50 text-gray-300 border-gray-600/50",
  Support: "bg-teal-900/50 text-teal-300 border-teal-700/50",
  Social: "bg-pink-900/50 text-pink-300 border-pink-700/50",
}

export function getTypeColor(type: AdversaryType): string {
  return TYPE_COLORS[type] || "bg-secondary text-secondary-foreground"
}

export function AdversaryLibrary({
  library,
  onAdd,
  onRemove,
  hasActiveEncounter,
}: AdversaryLibraryProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<AdversaryType | null>(null)
  const [tierFilter, setTierFilter] = useState<number | null>(null)

  const filtered = useMemo(() => {
    let result = library
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((a) => a.name.toLowerCase().includes(q))
    }
    if (typeFilter) {
      result = result.filter((a) => a.type === typeFilter)
    }
    if (tierFilter) {
      result = result.filter((a) => a.tier === tierFilter)
    }
    return result
  }, [library, search, typeFilter, tierFilter])

  // Collect used types for filter chips
  const usedTypes = useMemo(
    () => [...new Set(library.map((a) => a.type))].sort(
      (a, b) => ADVERSARY_TYPES.indexOf(a) - ADVERSARY_TYPES.indexOf(b)
    ),
    [library]
  )

  const usedTiers = useMemo(
    () => [...new Set(library.map((a) => a.tier))].sort(),
    [library]
  )

  if (library.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/70 italic py-2">
        No adversaries imported yet. Use the Adversaries tab to create some.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search adversaries..."
          className="pl-8 h-8 bg-input border-border text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {usedTiers.length > 1 &&
          usedTiers.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(tierFilter === t ? null : t)}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                tierFilter === t
                  ? "bg-gold/20 text-gold border-gold/40"
                  : "bg-input border-border text-muted-foreground hover:text-foreground"
              )}
            >
              Tier {t}
            </button>
          ))}
        {usedTypes.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? null : type)}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
              typeFilter === type
                ? "bg-gold/20 text-gold border-gold/40"
                : "bg-input border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider pb-1">
          {filtered.length} of {library.length} adversaries
        </div>
        {filtered.map((adv) => (
          <div
            key={adv.name}
            className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-purple-deep/30 border border-border group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground truncate">
                  {adv.name}
                </span>
                <Badge
                  className={cn(
                    "text-[9px] px-1.5 py-0 h-4 border",
                    getTypeColor(adv.type)
                  )}
                >
                  {adv.type}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground">
                T{adv.tier} · Diff {adv.difficulty} · HP {adv.hp} · {adv.damage} · {getPointCost(adv.type)}pt
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {hasActiveEncounter && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAdd(adv.name)}
                  className="h-7 w-7 text-gold hover:text-gold hover:bg-gold/10"
                  aria-label={`Add ${adv.name} to encounter`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(adv.name)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${adv.name} from library`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
