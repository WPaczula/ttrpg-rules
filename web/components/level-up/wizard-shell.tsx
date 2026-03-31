"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type WizardStep } from "@/lib/level-up-utils"
import { ChevronRight } from "lucide-react"

const STEP_LABELS: Record<Exclude<WizardStep, "idle">, string> = {
  "tier-achievement": "Tier Achievement",
  "advancements": "Advancements",
  "domain-card": "Domain Card",
  "confirm": "Confirm",
}

interface WizardShellProps {
  step: Exclude<WizardStep, "idle">
  currentLevel: number
  nextLevel: number
  onNext: () => void
  onBack: () => void
  canProceed: boolean
  children: React.ReactNode
}

export function WizardShell({
  step,
  currentLevel,
  nextLevel,
  onNext,
  onBack,
  canProceed,
  children,
}: WizardShellProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-gold font-semibold">
          Level {currentLevel} → {nextLevel}
        </span>
        <span className="ml-auto">
          {STEP_LABELS[step]}
        </span>
      </div>
      <Separator className="bg-border" />

      {children}

      {/* Navigation */}
      <Separator className="bg-border" />
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        {step !== "confirm" && (
          <Button
            size="sm"
            onClick={onNext}
            disabled={!canProceed}
            className="ml-auto bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
