"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RARITY_BADGE_COLORS, GOLD_LABELS } from "@/lib/loot-types"
import { ScrollText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

function rarityLabel(r: string) {
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface LogEntry {
  id: string
  type: "item" | "gold"
  timestamp: number
  name?: string
  rarity?: string
  itemType?: string
  tableIndex?: number
  goldDenomination?: string
}

interface SessionLogProps {
  log: LogEntry[]
  onClear: () => void
  confirmClear: boolean
}

export function SessionLog({ log, onClear, confirmClear }: SessionLogProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Session Log</span>
        <span className="text-[10px] text-muted-foreground ml-1">
          {log.length} entr{log.length === 1 ? "y" : "ies"}
        </span>
        {log.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className={cn(
              "ml-auto text-xs",
              confirmClear
                ? "text-destructive hover:text-destructive"
                : "text-muted-foreground hover:text-destructive"
            )}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {confirmClear ? "Confirm clear?" : "End Session"}
          </Button>
        )}
      </div>

      {log.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Nothing logged yet. Roll some loot!
        </p>
      )}

      <div className="space-y-1.5">
        {log.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 rounded-md border border-border bg-card/40 px-3 py-2"
          >
            {entry.type === "item" ? (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">{entry.name}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] border shrink-0", RARITY_BADGE_COLORS[entry.rarity as keyof typeof RARITY_BADGE_COLORS])}
                    >
                      {rarityLabel(entry.rarity!)}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] border border-border text-muted-foreground shrink-0">
                      {entry.itemType === "item" ? "Item" : "Consumable"}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground shrink-0">#{entry.tableIndex}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {formatTime(entry.timestamp)}
                </span>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <span className="text-sm text-gold/80">
                    +{GOLD_LABELS[entry.goldDenomination as keyof typeof GOLD_LABELS]} of gold
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {formatTime(entry.timestamp)}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
