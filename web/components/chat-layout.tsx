"use client"

import { useRef, useState } from "react"
import type { RefObject, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatLayoutProps {
  header?: ReactNode
  children: ReactNode
  scrollRef: RefObject<HTMLDivElement>
  placeholder: string
  isLoading: boolean
  onSubmit: (value: string) => void
}

export function ChatLayout({ header, children, scrollRef, placeholder, isLoading, onSubmit }: ChatLayoutProps) {
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setTimeout(() => {
      inputAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 300)
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    const value = input.value.trim()
    if (value && !isLoading) {
      onSubmit(value)
      input.value = ""
    }
  }

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {header}

        <div className="flex-1 overflow-y-auto p-4 pb-24" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {children}
          </div>
        </div>

        <div ref={inputAreaRef} className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              name="message"
              placeholder={placeholder}
              disabled={isLoading}
              autoComplete="off"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
            />
            <Button
              type="submit"
              disabled={isLoading}
              onMouseDown={(e) => e.preventDefault()}
              className="bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {!isInputFocused && (
          <footer className="px-4 py-2 text-center text-xs text-muted-foreground border-t border-border">
            <p>
              Uses material from the Daggerheart SRD 1.0, © Critical Role, LLC under the{" "}
              <a href="https://darringtonpress.com/license/" className="underline hover:text-gold">
                DPCGL
              </a>
              . Not affiliated with Critical Role or Darrington Press.
            </p>
          </footer>
        )}
      </div>
    </div>
  )
}
