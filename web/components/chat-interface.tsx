"use client"

import { useRef, useEffect, useMemo, useState, useCallback } from "react"
import { useChat, UIMessage } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { CharacterSummaryCard, parseCharacterFromToolCall } from "@/components/character/character-summary-card"
import type { CharacterData } from "@/lib/character-types"
import { getMessageContent, getToolResultFromMessage, makeWelcomeMessage } from "@/lib/chat-messages"
import { createChatStorage } from "@/lib/chat-storage"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import { Send, Swords } from "lucide-react"

const WELCOME_TEXT = `# Welcome, Adventurer!

I'm here to help you create your character. Together, we'll craft a hero with a compelling story and abilities that match your vision.

**What kind of character would you like to play?** Tell me about the concept you have in mind, or I can show you the available classes to help you decide!

*Your conversation is saved automatically. Type /clear to start fresh.*`

const storage = createChatStorage(
  "daggerheart-chat-messages",
  () => makeWelcomeMessage(WELCOME_TEXT),
  "daggerheart-chat-accepted",
)

interface ChatInterfaceProps {
  isActive?: boolean
  onApplyCharacter?: (character: CharacterData) => void
}

export function ChatInterface({ isActive, onApplyCharacter }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [acceptedCards, setAcceptedCards] = useState<Set<string>>(storage.loadAccepted)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    []
  )

  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    messages: storage.load(),
  })

  useEffect(() => {
    if (messages.length > 0) storage.save(messages)
  }, [messages])

  const isLoading = status === "streaming" || status === "submitted"

  useChatScroll(scrollRef, messages, isActive)

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setTimeout(() => {
      inputAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 300)
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
  }

  const handleApplyCharacter = useCallback((messageId: string, character: CharacterData) => {
    onApplyCharacter?.(character)
    setAcceptedCards(prev => {
      const next = new Set(prev)
      next.add(messageId)
      storage.saveAccepted(next)
      return next
    })
  }, [onApplyCharacter])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    const value = input.value.trim()

    if (value && !isLoading) {
      if (value.toLowerCase() === "/clear") {
        storage.clear()
        setMessages([makeWelcomeMessage(WELCOME_TEXT)])
        setAcceptedCards(new Set())
        input.value = ""
        return
      }

      sendMessage({ text: value })
      input.value = ""
    }
  }

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
              <Swords className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-sans font-semibold text-gold text-lg">Character Creator</h1>
              <p className="text-xs text-muted-foreground">TTRPG Compatible</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 pb-24" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => {
              const characterCard = message.role === "assistant"
                ? getToolResultFromMessage(message, "finalize_character", parseCharacterFromToolCall)
                : null
              const textContent = getMessageContent(message)

              return (
                <div key={message.id} className="space-y-3">
                  {textContent && (
                    <ChatMessage
                      role={message.role === "assistant" ? "bot" : "user"}
                      content={textContent}
                    />
                  )}
                  {characterCard?.data && (
                    <CharacterSummaryCard
                      data={characterCard.data}
                      onApplyToSheet={(char) => handleApplyCharacter(message.id, char)}
                      accepted={acceptedCards.has(message.id)}
                    />
                  )}
                  {characterCard && !characterCard.data && (
                    <div className="rounded-lg border border-gold/20 bg-card p-4 text-sm text-muted-foreground animate-pulse">
                      Building character sheet...
                    </div>
                  )}
                </div>
              )
            })}
            {isLoading && <TypingIndicator />}
          </div>
        </div>

        {/* Input Area */}
        <div ref={inputAreaRef} className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              ref={inputRef}
              name="message"
              placeholder={isLoading ? "Thinking..." : "Type your message..."}
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

        {/* Attribution Footer - hidden when input focused on mobile */}
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
