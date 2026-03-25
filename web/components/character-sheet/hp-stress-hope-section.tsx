"use client"

import type { CharacterData } from "@/lib/character-types"
import { Heart, Info } from "lucide-react"
import { Section, SlotTracker, NumberStepper, Counter } from "./primitives"
import { SRD_CLASSES } from "@/lib/srd-data"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

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
          <HopeActions characterClass={c.class} />
        </div>
      </div>
    </Section>
  )
}

function HopeActionItem({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-amber-500/70 hover:text-amber-400 transition-colors" aria-label={`Info about ${label}`}>
            <Info className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="text-sm">{description}</PopoverContent>
      </Popover>
    </div>
  )
}

function HopeActions({ characterClass }: { characterClass: string }) {
  const srdClass = SRD_CLASSES.find(
    (cls) => cls.name.toLowerCase() === characterClass?.toLowerCase()
  )
  const hopeFeature = srdClass?.hopeFeature

  return (
    <div className="flex flex-col items-center gap-1 mt-2 w-full">
      <HopeActionItem
        label="Help an Ally (1)"
        description="Spend 1 Hope to add +1d6 to an ally's action roll"
      />
      <HopeActionItem
        label="Use Experience (1)"
        description="Spend 1 Hope to add +2 to your roll using one of your experiences"
      />
      <HopeActionItem
        label="Tag Team (3)"
        description="Spend 3 Hope to make a Tag Team Roll with an ally — both roll and use the better result"
      />
      <HopeActionItem
        label={hopeFeature ? `${hopeFeature.name} (3)` : "Class Hope Feature (3)"}
        description={hopeFeature ? hopeFeature.text : "Select a class to see its Hope feature"}
      />
    </div>
  )
}
