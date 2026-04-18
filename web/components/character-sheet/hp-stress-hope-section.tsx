"use client"

import type { CharacterData } from "@/lib/character-types"
import { Heart, Info } from "lucide-react"
import { Section, SlotTracker, NumberStepper } from "./primitives"
import { SRD_CLASSES } from "@/lib/srd-data"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { SrdMarkdown } from "./srd-markdown"

const HOPE_MAX = 6

interface HpStressHopeSectionProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
  editing?: boolean
}

export function HpStressHopeSection({ character: c, update, editing }: HpStressHopeSectionProps) {
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
            {editing && (
              <NumberStepper
                label="Total"
                value={c.hpTotal}
                onChange={(v) => update({ hpTotal: v, hpMarked: Math.min(c.hpMarked, v) })}
                min={1}
                max={12}
              />
            )}
          </div>
          <SlotTracker
            total={c.hpTotal}
            marked={c.hpMarked}
            onToggle={(n) => update({ hpMarked: n })}
            variant="hp"
            severeFromIndex={Math.max(0, c.hpTotal - 2)}
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
            {editing && (
              <NumberStepper
                label="Total"
                value={c.stressTotal}
                onChange={(v) => update({ stressTotal: v, stressMarked: Math.min(c.stressMarked, v) })}
                min={1}
                max={12}
              />
            )}
          </div>
          <SlotTracker
            total={c.stressTotal}
            marked={c.stressMarked}
            onToggle={(n) => update({ stressMarked: n })}
            variant="stress"
            label="Stress"
          />
        </div>

        {/* Hope */}
        <div className="dh-hope-card">
          <div className="relative flex items-center justify-center">
            <div className="dh-hope-title">Hope</div>
            <HopeActionsPopover characterClass={c.class} />
          </div>
          <div className="dh-hope-diamonds">
            {Array.from({ length: HOPE_MAX }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => update({ hope: i < c.hope ? i : i + 1 })}
                className={`dh-diamond ${i < c.hope ? "is-filled" : ""}`}
                aria-label={`Hope ${i + 1} ${i < c.hope ? "(filled)" : "(empty)"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function HopeActionsPopover({ characterClass }: { characterClass: string }) {
  const srdClass = SRD_CLASSES.find(
    (cls) => cls.name.toLowerCase() === characterClass?.toLowerCase()
  )
  const hopeFeature = srdClass?.hopeFeature

  const actions: { label: string; cost: string; description: string }[] = [
    {
      label: "Help an Ally",
      cost: "1",
      description: "Spend 1 Hope to add **+1d6** to an ally's action roll.",
    },
    {
      label: "Use Experience",
      cost: "1",
      description: "Spend 1 Hope to add **+2** to your roll using one of your experiences.",
    },
    {
      label: "Tag Team",
      cost: "3",
      description: "Spend 3 Hope to make a **Tag Team Roll** with an ally — both roll and use the better result.",
    },
    {
      label: hopeFeature ? hopeFeature.name : "Class Feature",
      cost: "3",
      description: hopeFeature ? hopeFeature.text : "Select a class to see its Hope feature.",
    },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Hope spending options"
          className="absolute right-0 w-7 h-7 flex items-center justify-center rounded-md text-gold-dim hover:text-gold hover:bg-gold/10 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="px-3 py-2 border-b border-border">
          <p className="font-display text-xs tracking-[0.2em] text-gold uppercase">
            Spend Hope
          </p>
        </div>
        <ul className="divide-y divide-border">
          {actions.map((a) => (
            <li key={a.label} className="px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{a.label}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-gold-dim uppercase shrink-0">
                  Cost {a.cost}
                </span>
              </div>
              <SrdMarkdown className="text-xs text-muted-foreground mt-1">
                {a.description}
              </SrdMarkdown>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
