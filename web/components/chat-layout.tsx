"use client"

import { useRef, useState } from "react"
import type { RefObject, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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

  const submit = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const value = textarea.value.trim()
    if (value && !isLoading) {
      onSubmit(value)
      textarea.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.ctrlKey) {
      e.preventDefault()
      submit()
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
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto items-end">
            <Textarea
              ref={textareaRef}
              name="message"
              placeholder={placeholder}
              disabled={isLoading}
              autoComplete="off"
              rows={1}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              enterKeyHint="enter"
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20 min-h-0 max-h-24 resize-none overflow-y-auto"
            />
            <Button
              type="submit"
              disabled={isLoading}
              onMouseDown={(e) => e.preventDefault()}
              variant="gold"
              className="h-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <footer
          className={`px-4 py-2 text-center text-xs text-muted-foreground border-t border-border ${
            isInputFocused ? "hidden md:block" : ""
          }`}
        >
          <p>
            Uses material from the Daggerheart SRD 1.0, © Critical Role, LLC under the{" "}
            <a href="https://darringtonpress.com/license/" className="underline hover:text-gold">
              DPCGL
            </a>
            . Not affiliated with Critical Role or Darrington Press.
          </p>
        </footer>
      </div>
    </div>
  )
}
