"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field-label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Copy, X, Scroll } from "lucide-react"
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
                <FieldLabel asChild><p>Name</p></FieldLabel>
                <p className="text-foreground font-medium">{character.name}</p>
              </div>
            )}
            {character.class && (
              <div>
                <FieldLabel asChild><p>Class</p></FieldLabel>
                <p className="text-foreground font-medium">{character.class}</p>
              </div>
            )}
            {character.subclass && (
              <div>
                <FieldLabel asChild><p>Subclass</p></FieldLabel>
                <p className="text-foreground font-medium">{character.subclass}</p>
              </div>
            )}
            {character.ancestry && (
              <div>
                <FieldLabel asChild><p>Ancestry</p></FieldLabel>
                <p className="text-foreground font-medium">{character.ancestry}</p>
              </div>
            )}
            {character.community && (
              <div>
                <FieldLabel asChild><p>Community</p></FieldLabel>
                <p className="text-foreground font-medium">{character.community}</p>
              </div>
            )}
            {character.traits && character.traits.length > 0 && (
              <div>
                <FieldLabel asChild><p>Traits</p></FieldLabel>
                <div className="flex flex-wrap gap-1 mt-1">
                  {character.traits.map((trait, i) => (
                    <Badge
                      key={i}
                      variant="tier"
                      className="rounded-full text-gold-muted border-purple-glow/30"
                    >
                      {trait}
                    </Badge>
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
          variant="gold"
          className="w-full"
        >
          <Copy className="w-4 h-4 mr-2" />
          Export Character
        </Button>
      </div>
    </div>
  )
}
