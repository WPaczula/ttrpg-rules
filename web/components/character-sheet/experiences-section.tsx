"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatModifier, type Experience, type CharacterData } from "@/lib/character-types"
import { Star, Plus, Trash2 } from "lucide-react"
import { Section } from "./primitives"

interface ExperiencesSectionProps {
  experiences: Experience[]
  update: (patch: Partial<CharacterData>) => void
}

export function ExperiencesSection({ experiences, update }: ExperiencesSectionProps) {
  const addExperience = () => {
    const newExp: Experience = { id: crypto.randomUUID(), name: "", modifier: 2 }
    update({ experiences: [...experiences, newExp] })
  }

  const updateExperience = (id: string, patch: Partial<Experience>) => {
    update({
      experiences: experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })
  }

  const removeExperience = (id: string) => {
    update({ experiences: experiences.filter((e) => e.id !== id) })
  }

  return (
    <Section icon={<Star className="w-4 h-4" />} title="Experiences">
      <div className="space-y-2">
        {experiences.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            No experiences yet. Add them below.
          </p>
        )}
        {experiences.map((exp) => (
          <div key={exp.id} className="flex items-center gap-2">
            <Input
              value={exp.name}
              onChange={(e) => updateExperience(exp.id, { name: e.target.value })}
              placeholder="Experience name…"
              className="flex-1 h-9 bg-input border-border text-sm"
            />
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateExperience(exp.id, { modifier: Math.max(1, exp.modifier - 1) })}
                className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold text-gold">
                {formatModifier(exp.modifier)}
              </span>
              <button
                onClick={() => updateExperience(exp.id, { modifier: Math.min(6, exp.modifier + 1) })}
                className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeExperience(exp.id)}
              className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95"
              aria-label="Remove experience"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addExperience}
          className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold mt-1"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Experience
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Spend Hope to add an experience modifier to a relevant roll.
      </p>
    </Section>
  )
}
