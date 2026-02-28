"use client"

import type { CharacterData } from "@/lib/character-types"
import { Heart } from "lucide-react"
import { Section, SlotTracker, NumberStepper, Counter } from "./primitives"

interface HpStressHopeSectionProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
}

export function HpStressHopeSection({ character: c, update }: HpStressHopeSectionProps) {
  return (
    <Section icon={<Heart className="w-4 h-4" />} title="HP, Stress & Hope" defaultOpen>
      <div className="space-y-5">
        {/* HP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Hit Points
              <span className="text-xs text-muted-foreground ml-2">
                {c.hpMarked}/{c.hpTotal} marked
              </span>
            </span>
            <NumberStepper
              label="Total"
              value={c.hpTotal}
              onChange={(v) => update({ hpTotal: v, hpMarked: Math.min(c.hpMarked, v) })}
              min={1}
              max={12}
            />
          </div>
          <SlotTracker
            total={c.hpTotal}
            marked={c.hpMarked}
            onToggle={(n) => update({ hpMarked: n })}
            filledClass="bg-destructive/60 border-destructive"
            emptyClass="bg-transparent border-border hover:border-destructive/50"
            label="HP"
          />
        </div>

        {/* Stress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Stress
              <span className="text-xs text-muted-foreground ml-2">
                {c.stressMarked}/{c.stressTotal} marked
              </span>
            </span>
            <NumberStepper
              label="Total"
              value={c.stressTotal}
              onChange={(v) => update({ stressTotal: v, stressMarked: Math.min(c.stressMarked, v) })}
              min={1}
              max={12}
            />
          </div>
          <SlotTracker
            total={c.stressTotal}
            marked={c.stressMarked}
            onToggle={(n) => update({ stressMarked: n })}
            filledClass="bg-purple-glow/40 border-purple-glow"
            emptyClass="bg-transparent border-border hover:border-purple-glow/50"
            label="Stress"
          />
        </div>

        {/* Hope */}
        <div className="flex flex-col items-center gap-1 bg-purple-deep/50 border border-border rounded-lg p-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Hope</span>
          <Counter
            value={c.hope}
            onChange={(v) => update({ hope: v })}
            min={0}
            max={12}
            label="Hope"
          />
        </div>
      </div>
    </Section>
  )
}
