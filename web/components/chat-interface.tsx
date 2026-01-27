"use client"

import { useRef, useEffect, useMemo, useState } from "react"
import { useChat, UIMessage } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { Send, Swords } from "lucide-react"
import { Game } from "@/app/page"

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

interface ChatInterfaceProps {
  password: string
  game: Game
  onGameChange: (game: Game) => void
}

const STORAGE_KEYS: Record<Game, string> = {
  daggerheart: "daggerheart-chat-messages",
  dnd: "dnd-chat-messages",
}

const WELCOME_TEXTS: Record<Game, string> = {
  daggerheart: `# Welcome, Adventurer!

I'm here to help you create your character. Together, we'll craft a hero with a compelling story and abilities that match your vision.

**What kind of character would you like to play?** Tell me about the concept you have in mind, or I can show you the available classes to help you decide!

*Your conversation is saved automatically. Type /clear to start fresh.*`,
  dnd: `# Welcome to D&D!

I'm your D&D Starter Set rules assistant. Ask me anything about the rules, character creation, combat, spells, or any other aspect of the game.

**What would you like to know?**

*Your conversation is saved automatically. Type /clear to start fresh.*`,
}

function makeWelcomeMessage(game: Game) {
  const text = WELCOME_TEXTS[game]
  return {
    id: "welcome",
    role: "assistant" as const,
    content: text,
    parts: [{ type: "text" as const, text }],
  }
}

function loadMessages(game: Game): UIMessage[] {
  if (typeof window === "undefined") return [makeWelcomeMessage(game)]
  try {
    const saved = localStorage.getItem(STORAGE_KEYS[game])
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // Invalid data, ignore
  }
  return [makeWelcomeMessage(game)]
}

function saveMessages(game: Game, messages: UIMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEYS[game], JSON.stringify(messages))
  } catch {
    // Storage full or unavailable, ignore
  }
}

function clearMessages(game: Game) {
  try {
    localStorage.removeItem(STORAGE_KEYS[game])
  } catch {
    // Ignore errors
  }
}

export function ChatInterface({ password, game, onGameChange }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { password, game },
      }),
    [password, game]
  )

  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    messages: loadMessages(game),
  })

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(game, messages)
    }
  }, [messages, game])

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    const value = input.value.trim()

    if (value && !isLoading) {
      // Handle /clear command
      if (value.toLowerCase() === "/clear") {
        clearMessages(game)
        setMessages([makeWelcomeMessage(game)])
        input.value = ""
        return
      }

      sendMessage({ text: value })
      input.value = ""
    }
  }

  return (
    <div className="flex h-dvh bg-background">
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

        {/* Game Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => onGameChange("dnd")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${game === "dnd"
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            D&D
          </button>
          <button
            onClick={() => onGameChange("daggerheart")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${game === "daggerheart"
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Daggerheart
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 pb-24" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role === "assistant" ? "bot" : "user"}
                content={getMessageContent(message)}
              />
            ))}
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
            {game === "daggerheart" ? (
              <p>
                Uses material from the Daggerheart SRD 1.0, © Critical Role, LLC under the{" "}
                <a href="https://darringtonpress.com/license/" className="underline hover:text-gold">
                  DPCGL
                </a>
                . Not affiliated with Critical Role or Darrington Press.
              </p>
            ) : (
              <p>
                Uses material from the D&D Starter Set. D&D is a trademark of Wizards of the Coast.
              </p>
            )}
          </footer>
        )}
      </div>
    </div>
  )
}
