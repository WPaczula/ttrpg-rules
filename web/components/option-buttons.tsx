"use client"

import { Button } from "@/components/ui/button"

interface OptionButtonsProps {
  options: string[]
  onSelect: (option: string) => void
  disabled?: boolean
}

export function OptionButtons({ options, onSelect, disabled }: OptionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold hover:border-gold/60 transition-all bg-transparent"
        >
          {option}
        </Button>
      ))}
    </div>
  )
}
