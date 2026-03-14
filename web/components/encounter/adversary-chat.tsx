"use client"

import { useRef, useEffect, useMemo, useState, useCallback } from "react"
import { useChat, UIMessage } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { EncounterProposal, parseProposalFromToolCall } from "@/components/encounter/encounter-proposal"
import { AdversarySummaryCard, parseAdversaryFromToolCall } from "@/components/encounter/adversary-summary-card"
import { Counter } from "@/components/character-sheet/primitives"
import type { Adversary } from "@/lib/adversary-types"
import { Send, Bot, Users, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

// Extract text content from AI SDK message parts
function getMessageContent(message: UIMessage): string {
  if (message.content) return message.content
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

// Check if a message has a create_adversary tool invocation
function getAdversaryFromMessage(message: UIMessage): { data: ReturnType<typeof parseAdversaryFromToolCall>; state: string } | null {
  if (!message.parts) return null
  for (const part of message.parts) {
    if ((part as any).type === "tool-create_adversary") {
      const output = getToolOutput(part)
      if (output != null) {
        const data = parseAdversaryFromToolCall(output)
        return data ? { data, state: "output-available" } : null
      }
      return { data: null, state: (part as any).state ?? "input-streaming" }
    }
  }
  return null
}

// Check if a message has a propose_encounter tool invocation
function getProposalFromMessage(message: UIMessage): { data: ReturnType<typeof parseProposalFromToolCall>; state: string } | null {
  if (!message.parts) return null
  for (const part of message.parts) {
    if ((part as any).type === "tool-propose_encounter") {
      const output = getToolOutput(part)
      if (output != null) {
        const data = parseProposalFromToolCall(output)
        return data ? { data, state: "output-available" } : null
      }
      return { data: null, state: (part as any).state ?? "input-streaming" }
    }
  }
  return null
}

interface AdversaryChatProps {
  password: string
  isActive?: boolean
  onAcceptEncounter: (name: string, adversaries: Adversary[]) => void
  onAddAdversary: (adversary: Adversary) => void
}

const STORAGE_KEY = "daggerheart-adversary-chat-messages"
const ACCEPTED_KEY = "daggerheart-adversary-chat-accepted"

const WELCOME_TEXT = `# Encounter Builder

I'll help you design balanced combat encounters for your Daggerheart session. Tell me about the kind of fight you're looking for — a theme, narrative context, or difficulty preference — and I'll put together an encounter within your battle point budget.

**Set your party size and tier above, then describe what you need!**

*Type /clear to start a new conversation.*`

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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return [makeWelcomeMessage()]
}

function saveMessages(messages: UIMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch { /* ignore */ }
}

function clearMessages() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACCEPTED_KEY)
  } catch { /* ignore */ }
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

const PC_COUNT_KEY = "daggerheart-adversary-pc-count"
const PC_TIER_KEY = "daggerheart-adversary-pc-tier"

function loadPcCount(): number {
  if (typeof window === "undefined") return 4
  return Number(localStorage.getItem(PC_COUNT_KEY)) || 4
}

function loadPcTier(): number {
  if (typeof window === "undefined") return 1
  return Number(localStorage.getItem(PC_TIER_KEY)) || 1
}

export function AdversaryChat({ password, isActive, onAcceptEncounter, onAddAdversary }: AdversaryChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pcCount, setPcCountState] = useState(loadPcCount)
  const [pcTier, setPcTierState] = useState(loadPcTier)
  const [acceptedProposals, setAcceptedProposals] = useState<Set<string>>(loadAccepted)

  // Mutable body ref so the transport always sends current values
  const bodyRef = useRef({ password, pcCount, pcTier })

  const setPcCount = useCallback((v: number) => {
    setPcCountState(v)
    bodyRef.current.pcCount = v
    try { localStorage.setItem(PC_COUNT_KEY, String(v)) } catch { /* ignore */ }
  }, [])

  const setPcTier = useCallback((v: number) => {
    setPcTierState(v)
    bodyRef.current.pcTier = v
    try { localStorage.setItem(PC_TIER_KEY, String(v)) } catch { /* ignore */ }
  }, [])

  // Keep password in sync
  bodyRef.current.password = password

  // Stable transport — bodyRef.current is mutated in place so the
  // same object reference always reflects current pcCount/pcTier
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/adversary-chat",
        body: bodyRef.current,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [password]
  )

  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    messages: loadMessages(),
  })

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages)
  }, [messages])

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "user") {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages.length])

  useEffect(() => {
    if (isActive) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "instant",
      })
    }
  }, [isActive])

  const handleAccept = useCallback((messageId: string, name: string, adversaries: Adversary[]) => {
    onAcceptEncounter(name, adversaries)
    setAcceptedProposals(prev => {
      const next = new Set(prev)
      next.add(messageId)
      saveAccepted(next)
      return next
    })
  }, [onAcceptEncounter])

  const handleAddAdversary = useCallback((messageId: string, adversary: Adversary) => {
    onAddAdversary(adversary)
    setAcceptedProposals(prev => {
      const next = new Set(prev)
      next.add(messageId)
      saveAccepted(next)
      return next
    })
  }, [onAddAdversary])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    const value = input.value.trim()

    if (value && !isLoading) {
      if (value.toLowerCase() === "/clear") {
        clearMessages()
        setMessages([makeWelcomeMessage()])
        setAcceptedProposals(new Set())
        input.value = ""
        return
      }
      sendMessage({ text: value })
      input.value = ""
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Config bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
              <Bot className="w-4 h-4 text-gold" />
            </div>
            <span className="font-semibold text-gold text-sm hidden sm:inline">AI Builder</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">PCs</span>
              <Counter
                value={pcCount}
                onChange={setPcCount}
                min={1}
                max={10}
                label="PC Count"
                size="sm"
              />
            </div>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tier</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map(t => (
                  <button
                    key={t}
                    onClick={() => setPcTier(t)}
                    className={cn(
                      "w-6 h-6 rounded text-xs font-bold transition-colors",
                      pcTier === t
                        ? "bg-gold text-background"
                        : "bg-input text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 pb-24" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => {
              const proposal = message.role === "assistant" ? getProposalFromMessage(message) : null
              const adversaryCard = message.role === "assistant" ? getAdversaryFromMessage(message) : null
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
                  {/* Render proposal if present */}
                  {proposal?.data && (
                    <EncounterProposal
                      data={proposal.data}
                      pcCount={pcCount}
                      onAccept={(data) => handleAccept(message.id, data.name, data.adversaries as Adversary[])}
                      accepted={acceptedProposals.has(message.id)}
                    />
                  )}
                  {/* Proposal loading state */}
                  {proposal && !proposal.data && (
                    <div className="rounded-lg border border-gold/20 bg-card p-4 text-sm text-muted-foreground animate-pulse">
                      Building encounter...
                    </div>
                  )}
                  {/* Render adversary summary card if present */}
                  {adversaryCard?.data && (
                    <AdversarySummaryCard
                      data={adversaryCard.data}
                      onAddToEncounter={(adv) => handleAddAdversary(message.id, adv)}
                      accepted={acceptedProposals.has(message.id)}
                    />
                  )}
                  {/* Adversary card loading state */}
                  {adversaryCard && !adversaryCard.data && (
                    <div className="rounded-lg border border-gold/20 bg-card p-4 text-sm text-muted-foreground animate-pulse">
                      Designing adversary...
                    </div>
                  )}
                </div>
              )
            })}
            {isLoading && <TypingIndicator />}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              ref={inputRef}
              name="message"
              placeholder={isLoading ? "Thinking..." : "Describe the encounter you want..."}
              disabled={isLoading}
              autoComplete="off"
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
      </div>
    </div>
  )
}
