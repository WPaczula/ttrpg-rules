"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import { type DomainCard, type CharacterData, DOMAIN_CARD_THRESHOLD_BONUSES } from "@/lib/character-types"
import { SRD_DOMAIN_CARDS } from "@/lib/srd-data"
import { BookOpen, Plus, Trash2, Shield } from "lucide-react"
import { Section } from "./primitives"
import { SrdMarkdown } from "./srd-markdown"

interface DomainCardsSectionProps {
  domainCards: DomainCard[]
  domainCardItems: ComboboxItem[]
  thresholdBonuses: { [sourceId: string]: { major: number; severe: number } }
  proficiency: number
  update: (patch: Partial<CharacterData>) => void
  editing?: boolean
}

export function DomainCardsSection({ domainCards, domainCardItems, thresholdBonuses, proficiency, update, editing = false }: DomainCardsSectionProps) {
  const addDomainCard = () => {
    if (domainCards.length >= 5) return
    const newCard: DomainCard = { id: crypto.randomUUID(), name: "", level: 1, domain: "" }
    update({ domainCards: [...domainCards, newCard] })
  }

  const updateDomainCard = (id: string, patch: Partial<DomainCard>) => {
    update({
      domainCards: domainCards.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })
  }

  const removeDomainCard = (id: string) => {
    const removed = domainCards.find((d) => d.id === id)
    const patch: Partial<CharacterData> = { domainCards: domainCards.filter((d) => d.id !== id) }
    // Clean up threshold bonus if the removed card had one
    if (removed) {
      const sourceId = `card:${removed.name}`
      if (thresholdBonuses[sourceId]) {
        const next = { ...thresholdBonuses }
        delete next[sourceId]
        patch.thresholdBonuses = next
      }
    }
    update(patch)
  }

  return (
    <Section icon={<BookOpen className="w-4 h-4" />} title="Domain Cards">
      <div className="space-y-3">
        {domainCards.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No domain cards yet.</p>
        )}
        {domainCards.map((card) => {
          const srdCard = SRD_DOMAIN_CARDS.find((dc) => dc.name === card.name)
          return (
            <div key={card.id} className="space-y-1.5 bg-purple-deep/30 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                {editing ? (
                  <div className="flex-1">
                    <Combobox
                      items={domainCardItems}
                      value={card.name}
                      onSelect={(name) => {
                        const match = SRD_DOMAIN_CARDS.find((dc) => dc.name === name)
                        if (match) {
                          updateDomainCard(card.id, { name, level: match.level, domain: match.domain })
                        } else {
                          updateDomainCard(card.id, { name })
                        }
                      }}
                      placeholder="Search domain cards…"
                      searchPlaceholder="Type to search cards…"
                      className="h-8 text-sm font-medium"
                    />
                  </div>
                ) : (
                  <span className="flex-1 text-sm font-medium text-foreground truncate">
                    {card.name || <span className="text-muted-foreground italic">Unnamed card</span>}
                  </span>
                )}
                {editing && (
                  <button
                    onClick={() => removeDomainCard(card.id)}
                    className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95 shrink-0"
                    aria-label="Remove card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {srdCard && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge className="bg-purple-glow/20 text-gold border-purple-glow/40 text-[10px] px-1.5 py-0">
                      {srdCard.domain}
                    </Badge>
                    <span>Lvl {srdCard.level}</span>
                    <span>· Recall {srdCard.recallCost}</span>
                  </div>
                  <SrdMarkdown className="text-muted-foreground/80">
                    {srdCard.description}
                  </SrdMarkdown>
                  {(() => {
                    const bonusDef = DOMAIN_CARD_THRESHOLD_BONUSES[card.name]
                    if (!bonusDef) return null
                    const sourceId = `card:${card.name}`
                    const isActive = !!thresholdBonuses[sourceId]
                    const majorVal = bonusDef.major === "proficiency" ? proficiency : bonusDef.major
                    const severeVal = bonusDef.severe === "proficiency" ? proficiency : bonusDef.severe
                    const bonusLabel = [
                      majorVal > 0 ? `+${majorVal} Major` : "",
                      severeVal > 0 ? `+${severeVal} Severe` : "",
                    ].filter(Boolean).join(", ")
                    return (
                      <button
                        onClick={() => {
                          const next = { ...thresholdBonuses }
                          if (isActive) {
                            delete next[sourceId]
                          } else {
                            next[sourceId] = { major: majorVal, severe: severeVal }
                          }
                          update({ thresholdBonuses: next })
                        }}
                        className={`flex items-center gap-1.5 mt-1 px-2 py-1 rounded text-[11px] border transition-colors ${
                          isActive
                            ? "bg-gold/20 border-gold/50 text-gold"
                            : "bg-transparent border-border text-muted-foreground hover:border-gold/30"
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        Threshold: {bonusLabel}
                        <span className="ml-1 text-[10px]">{isActive ? "ON" : "OFF"}</span>
                      </button>
                    )
                  })()}
                </div>
              )}
              {!srdCard && card.name && editing && (
                <div className="flex gap-2">
                  <Input
                    value={card.domain}
                    onChange={(e) => updateDomainCard(card.id, { domain: e.target.value })}
                    placeholder="Domain"
                    className="flex-1 h-7 bg-input border-border text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Lvl</span>
                    <select
                      value={card.level}
                      onChange={(e) => updateDomainCard(card.id, { level: Number(e.target.value) })}
                      className="bg-input border border-border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gold h-7"
                      aria-label="Card level"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {!srdCard && card.name && !editing && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {card.domain && (
                    <Badge className="bg-purple-glow/20 text-gold border-purple-glow/40 text-[10px] px-1.5 py-0">
                      {card.domain}
                    </Badge>
                  )}
                  <span>Lvl {card.level}</span>
                </div>
              )}
            </div>
          )
        })}
        {editing && domainCards.length < 5 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={addDomainCard}
            className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Card
            <span className="ml-auto text-xs text-muted-foreground">
              {domainCards.length}/5
            </span>
          </Button>
        ) : !editing ? (
          <p className="text-xs text-muted-foreground text-center">
            {domainCards.length}/5 active cards
          </p>
        ) : (
          <p className="text-xs text-muted-foreground text-center italic">
            Maximum 5 active domain cards.
          </p>
        )}
      </div>
    </Section>
  )
}
