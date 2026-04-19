"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StepperButton } from "@/components/ui/stepper-button"
import { formatModifier, type Experience, type CharacterData } from "@/lib/character-types"
import { Star, Plus, Trash2 } from "lucide-react"
import { Section } from "./primitives"

interface ExperiencesSectionProps {
  experiences: Experience[]
  update: (patch: Partial<CharacterData>) => void
  editing?: boolean
}

export function ExperiencesSection({ experiences, update, editing = false }: ExperiencesSectionProps) {
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
            No experiences yet.{editing ? " Add them below." : ""}
          </p>
        )}
        {experiences.map((exp) => (
          <div key={exp.id} className="flex items-center gap-2">
            {editing ? (
              <Input
                value={exp.name}
                onChange={(e) => updateExperience(exp.id, { name: e.target.value })}
                placeholder="Experience name…"
                className="flex-1 h-9 bg-input border-border text-sm"
              />
            ) : (
              <span className="flex-1 text-sm text-foreground truncate">
                {exp.name || <span className="text-muted-foreground italic">Unnamed</span>}
              </span>
            )}
            {editing ? (
              <div className="flex items-center gap-1 shrink-0">
                <StepperButton
                  onClick={() => updateExperience(exp.id, { modifier: Math.max(1, exp.modifier - 1) })}
                  aria-label="Decrease modifier"
                >
                  −
                </StepperButton>
                <span className="w-8 text-center text-sm font-bold text-gold">
                  {formatModifier(exp.modifier)}
                </span>
                <StepperButton
                  onClick={() => updateExperience(exp.id, { modifier: Math.min(6, exp.modifier + 1) })}
                  aria-label="Increase modifier"
                >
                  +
                </StepperButton>
              </div>
            ) : (
              <span className="text-sm font-bold text-gold shrink-0">
                {formatModifier(exp.modifier)}
              </span>
            )}
            {editing && (
              <button
                onClick={() => removeExperience(exp.id)}
                className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95"
                aria-label="Remove experience"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={addExperience}
            className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold mt-1"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Experience
          </Button>
        )}
      </div>
    </Section>
  )
}
