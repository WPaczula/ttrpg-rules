"use client"

import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import { InfoBox } from "@/components/ui/info-box"
import { type SrdDomainCard } from "@/lib/srd-data"
import { StepHeader } from "./primitives"
import { BookOpen } from "lucide-react"

interface DomainCardStepProps {
  domainCardItems: ComboboxItem[]
  newDomainCard: string
  onSelect: (value: string) => void
  srdNewCard: SrdDomainCard | undefined
  existingCardCount: number
}

export function DomainCardStep({
  domainCardItems,
  newDomainCard,
  onSelect,
  srdNewCard,
  existingCardCount,
}: DomainCardStepProps) {
  return (
    <div className="space-y-4">
      <StepHeader
        icon={<BookOpen className="w-5 h-5" />}
        title="Domain Card"
      />
      <p className="text-sm text-muted-foreground">
        Take an additional domain card of your level or lower from a domain
        you have access to. You can also skip this step.
      </p>

      <Combobox
        items={domainCardItems}
        value={newDomainCard}
        onSelect={onSelect}
        placeholder="Search domain cards..."
        searchPlaceholder="Type to search cards..."
        className="h-9 text-sm"
      />

      {srdNewCard && (
        <InfoBox>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="tier" className="text-[10px] px-1.5 py-0">
              {srdNewCard.domain}
            </Badge>
            <span>Lvl {srdNewCard.level}</span>
            <span>· Recall {srdNewCard.recallCost}</span>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {srdNewCard.description}
          </p>
        </InfoBox>
      )}

      {existingCardCount >= 5 && newDomainCard && (
        <p className="text-xs text-amber-400/80">
          Your loadout is full (5/5). The new card will be added — you may need
          to move a card to your vault on the Character Sheet.
        </p>
      )}
    </div>
  )
}
