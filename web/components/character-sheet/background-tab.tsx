"use client"

import { Textarea } from "@/components/ui/textarea"
import type { CharacterData } from "@/lib/character-types"
import { NotebookPen } from "lucide-react"
import { Section } from "./primitives"

interface BackgroundTabProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
}

export function BackgroundTab({ character: c, update }: BackgroundTabProps) {
  return (
    <Section icon={<NotebookPen className="w-4 h-4" />} title="Notes">
      <Textarea
        value={c.notes}
        onChange={(e) => update({ notes: e.target.value })}
        placeholder="Backstory, session notes, reminders…"
        className="min-h-[120px] bg-input border-border text-sm resize-none"
      />
    </Section>
  )
}
