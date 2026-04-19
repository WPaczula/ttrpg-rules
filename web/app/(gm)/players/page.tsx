"use client"

import { Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SlotTracker } from "@/components/character-sheet/primitives"
import { usePlayersLive, type PlayerSummary } from "@/hooks/use-players-live"

const HOPE_MAX = 6

export default function PlayersPage() {
  const { players, isLoading, error } = usePlayersLive()

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="py-4 space-y-2">
          <h1 className="font-display text-[28px] leading-none font-semibold tracking-wide text-gold flex items-center gap-3">
            <Users className="w-6 h-6 shrink-0" />
            Players
          </h1>
          <p className="text-xs text-muted-foreground">
            Live view of each player&apos;s armor, HP, stress, and hope.
          </p>
        </div>
        <Separator className="bg-border mb-1" />

        {isLoading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load players.
          </div>
        )}

        {!isLoading && !error && players.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No players yet.</p>
          </div>
        )}

        {!isLoading && players.length > 0 && (
          <div className="space-y-3 pt-2">
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerCard({ player: p }: { player: PlayerSummary }) {
  const noop = () => {}
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-gold">
          {p.name || "Unnamed"}
        </h2>
      </div>

      <StatRow label="Armor" marked={p.armorMarked} total={p.armorScore}>
        <SlotTracker
          total={p.armorScore}
          marked={p.armorMarked}
          onToggle={noop}
          variant="armor"
          label="Armor"
        />
      </StatRow>

      <StatRow label="HP" marked={p.hpMarked} total={p.hpTotal}>
        <SlotTracker
          total={p.hpTotal}
          marked={p.hpMarked}
          onToggle={noop}
          variant="hp"
          severeFromIndex={Math.max(0, p.hpTotal - 2)}
          label="HP"
        />
      </StatRow>

      <StatRow label="Stress" marked={p.stressMarked} total={p.stressTotal}>
        <SlotTracker
          total={p.stressTotal}
          marked={p.stressMarked}
          onToggle={noop}
          variant="stress"
          label="Stress"
        />
      </StatRow>

      <StatRow label="Hope" marked={p.hope} total={HOPE_MAX}>
        <div className="flex gap-1.5">
          {Array.from({ length: HOPE_MAX }).map((_, i) => (
            <span
              key={i}
              className={`dh-diamond ${i < p.hope ? "is-filled" : ""}`}
              aria-label={`Hope ${i + 1} ${i < p.hope ? "(filled)" : "(empty)"}`}
            />
          ))}
        </div>
      </StatRow>
    </div>
  )
}

function StatRow({
  label,
  marked,
  total,
  children,
}: {
  label: string
  marked: number
  total: number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {marked}/{total}
        </span>
      </div>
      {children}
    </div>
  )
}
