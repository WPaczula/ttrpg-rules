"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Copy, X, Scroll, Check } from "lucide-react"
import { toast } from "react-toastify"

export interface CharacterData {
  name?: string
  class?: string
  subclass?: string
  ancestry?: string
  community?: string
  traits?: string[]
}

interface CharacterSheetProps {
  character: CharacterData
  onClose?: () => void
  showClose?: boolean
}

export function CharacterSheet({ character, onClose, showClose }: CharacterSheetProps) {
  const hasData = Object.values(character).some(
    (value) => value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  )

  const exportCharacter = () => {
    const lines = [
      "# Daggerheart Character Sheet",
      "",
      character.name ? `**Name:** ${character.name}` : null,
      character.class ? `**Class:** ${character.class}` : null,
      character.subclass ? `**Subclass:** ${character.subclass}` : null,
      character.ancestry ? `**Ancestry:** ${character.ancestry}` : null,
      character.community ? `**Community:** ${character.community}` : null,
      character.traits && character.traits.length > 0
        ? `**Traits:** ${character.traits.join(", ")}`
        : null,
    ].filter(Boolean)

    const markdown = lines.join("\n")
    navigator.clipboard.writeText(markdown)
    toast.success("Character copied to clipboard!") // Use toast
  }

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Scroll className="w-5 h-5 text-gold" />
          <h2 className="font-sans font-semibold text-gold">Your Character</h2>
        </div>
        {showClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {hasData ? (
          <div className="space-y-4">
            {character.name && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                <p className="text-foreground font-medium">{character.name}</p>
              </div>
            )}
            {character.class && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Class</p>
                <p className="text-foreground font-medium">{character.class}</p>
              </div>
            )}
            {character.subclass && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Subclass</p>
                <p className="text-foreground font-medium">{character.subclass}</p>
              </div>
            )}
            {character.ancestry && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ancestry</p>
                <p className="text-foreground font-medium">{character.ancestry}</p>
              </div>
            )}
            {character.community && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Community</p>
                <p className="text-foreground font-medium">{character.community}</p>
              </div>
            )}
            {character.traits && character.traits.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Traits</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {character.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-purple-glow/20 text-gold-muted rounded-full border border-purple-glow/30"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <Scroll className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-sm">
              Your character will appear here as you build them
            </p>
          </div>
        )}
      </ScrollArea>

      <Separator className="bg-border" />

      <div className="p-4">
        <Button
          onClick={exportCharacter}
          disabled={!hasData}
          className="w-full bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
        >
          <Copy className="w-4 h-4 mr-2" />
          Export Character
        </Button>
      </div>
    </div>
  )
}
