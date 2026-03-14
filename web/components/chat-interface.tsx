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
import { Send, Swords } from "lucide-react"

// Extract text content from AI SDK v6 message parts
function getMessageContent(message: UIMessage): string {
  // If content exists (e.g., our initial message), use it
  if (message.content) return message.content

  // Otherwise extract from parts
  if (!message.parts) return ""

  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
}

// AI SDK v6: tool parts use type "tool-{toolName}", state "output-available", result at part.output

function getToolOutput(part: unknown): string | null {
  const p = part as any
  if (p.state !== "output-available" || p.output == null) return null
  return typeof p.output === "string" ? p.output : JSON.stringify(p.output)
}

// Check if a message has a finalize_character tool invocation
function getCharacterFromMessage(message: UIMessage): { data: CharacterData | null; state: string } | null {
  if (!message.parts) return null
  for (const part of message.parts) {
    if ((part as any).type === "tool-finalize_character") {
      const output = getToolOutput(part)
      if (output != null) {
        const data = parseCharacterFromToolCall(output)
        return data ? { data, state: "output-available" } : null
      }
      return { data: null, state: (part as any).state ?? "input-streaming" }
    }
  }
  return null
}

interface ChatInterfaceProps {
  isActive?: boolean
  onApplyCharacter?: (character: CharacterData) => void
}

const STORAGE_KEY = "daggerheart-chat-messages"
const ACCEPTED_KEY = "daggerheart-chat-accepted"

const WELCOME_TEXT = `# Welcome, Adventurer!

I'm here to help you create your character. Together, we'll craft a hero with a compelling story and abilities that match your vision.

**What kind of character would you like to play?** Tell me about the concept you have in mind, or I can show you the available classes to help you decide!

*Your conversation is saved automatically. Type /clear to start fresh.*`

function makeWelcomeMessage() {
  const text = WELCOME_TEXT
  return {
    id: "welcome",
    role: "assistant" as const,
    content: text,
    parts: [{ type: "text" as const, text }],
  }
}

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [makeWelcomeMessage()]
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // Invalid data, ignore
  }
  return [makeWelcomeMessage()]
}

function saveMessages(messages: UIMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Storage full or unavailable, ignore
  }
}

function clearMessages() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACCEPTED_KEY)
  } catch {
    // Ignore errors
  }
}

function loadAccepted(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const saved = localStorage.getItem(ACCEPTED_KEY)
    if (saved) return new Set(JSON.parse(saved))
  } catch { /* ignore */ }
  return new Set()
}

function saveAccepted(accepted: Set<string>) {
  try {
    localStorage.setItem(ACCEPTED_KEY, JSON.stringify([...accepted]))
  } catch { /* ignore */ }
}

export function ChatInterface({ isActive, onApplyCharacter }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [acceptedCards, setAcceptedCards] = useState<Set<string>>(loadAccepted)

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
    messages: loadMessages(),
  })

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages)
    }
  }, [messages])

  const isLoading = status === "streaming" || status === "submitted"

  // Auto-scroll to bottom when user sends a message (so they see the assistant response)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "user") {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages.length])

  // Auto-scroll to bottom when switching back to the chat tab
  useEffect(() => {
    if (isActive) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "instant",
      })
    }
  }, [isActive])

  // Scroll input area into view when focused (for mobile keyboard)
  const handleInputFocus = () => {
    setIsInputFocused(true)
    setTimeout(() => {
      inputAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 300) // Delay to allow keyboard to appear
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
  }

  const handleApplyCharacter = useCallback((messageId: string, character: CharacterData) => {
    onApplyCharacter?.(character)
    setAcceptedCards(prev => {
      const next = new Set(prev)
      next.add(messageId)
      saveAccepted(next)
      return next
    })
  }, [onApplyCharacter])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    const value = input.value.trim()

    if (value && !isLoading) {
      // Handle /clear command
      if (value.toLowerCase() === "/clear") {
        clearMessages()
        setMessages([makeWelcomeMessage()])
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
              const characterCard = message.role === "assistant" ? getCharacterFromMessage(message) : null
              const textContent = getMessageContent(message)

              return (
                <div key={message.id} className="space-y-3">
                  {/* Render text content if present */}
                  {textContent && (
                    <ChatMessage
                      role={message.role === "assistant" ? "bot" : "user"}
                      content={textContent}
                    />
                  )}
                  {/* Render character summary card if present */}
                  {characterCard?.data && (
                    <CharacterSummaryCard
                      data={characterCard.data}
                      onApplyToSheet={(char) => handleApplyCharacter(message.id, char)}
                      accepted={acceptedCards.has(message.id)}
                    />
                  )}
                  {/* Character card loading state */}
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
