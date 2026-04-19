"use client"

import { useRef, useEffect, useMemo, useState, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { EncounterProposal, parseProposalFromToolCall } from "@/components/encounter/encounter-proposal"
import { AdversarySummaryCard, parseAdversaryFromToolCall } from "@/components/encounter/adversary-summary-card"
import { Counter } from "@/components/character-sheet/primitives"
import type { Adversary } from "@/lib/adversary-types"
import { getMessageContent, getToolResultFromMessage, makeWelcomeMessage } from "@/lib/chat-messages"
import { createChatStorage } from "@/lib/chat-storage"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import { ChatLayout } from "@/components/chat-layout"
import { Bot, Users, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const WELCOME_TEXT = `# Encounter Builder

I'll help you design balanced combat encounters for your Daggerheart session. Tell me about the kind of fight you're looking for — a theme, narrative context, or difficulty preference — and I'll put together an encounter within your battle point budget.

**Set your party size and tier above, then describe what you need!**

*Type /clear to start a new conversation.*`

const storage = createChatStorage(
  "daggerheart-adversary-chat-messages",
  () => makeWelcomeMessage(WELCOME_TEXT),
  "daggerheart-adversary-chat-accepted",
)

interface AdversaryChatProps {
  isActive?: boolean
  onAcceptEncounter: (name: string, adversaries: Adversary[]) => void
  onAddAdversary: (adversary: Adversary) => void
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

export function AdversaryChat({ isActive, onAcceptEncounter, onAddAdversary }: AdversaryChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pcCount, setPcCountState] = useState(loadPcCount)
  const [pcTier, setPcTierState] = useState(loadPcTier)
  const [acceptedProposals, setAcceptedProposals] = useState<Set<string>>(storage.loadAccepted)

  const bodyRef = useRef({ pcCount, pcTier })

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

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/adversary-chat",
        body: bodyRef.current,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleAccept = useCallback((messageId: string, name: string, adversaries: Adversary[]) => {
    onAcceptEncounter(name, adversaries)
    setAcceptedProposals(prev => {
      const next = new Set(prev)
      next.add(messageId)
      storage.saveAccepted(next)
      return next
    })
  }, [onAcceptEncounter])

  const handleAddAdversary = useCallback((messageId: string, adversary: Adversary) => {
    onAddAdversary(adversary)
    setAcceptedProposals(prev => {
      const next = new Set(prev)
      next.add(messageId)
      storage.saveAccepted(next)
      return next
    })
  }, [onAddAdversary])

  const handleSubmit = (value: string) => {
    if (value.toLowerCase() === "/clear") {
      storage.clear()
      setMessages([makeWelcomeMessage(WELCOME_TEXT)])
      setAcceptedProposals(new Set())
      return
    }
    sendMessage({ text: value })
  }

  const header = (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-gold shrink-0" />
        <span className="font-display text-sm font-semibold tracking-[0.16em] text-gold uppercase hidden sm:inline">
          AI Builder
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gold-dim" />
          <span className="dh-feat-group-label !mb-0">PCs</span>
          <Counter
            value={pcCount}
            onChange={setPcCount}
            min={1}
            max={10}
            label="PC Count"
            size="sm"
          />
        </div>
        <div className="w-px h-5 bg-border-strong" />
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-gold-dim" />
          <span className="dh-feat-group-label !mb-0">Tier</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map(t => (
              <button
                key={t}
                onClick={() => setPcTier(t)}
                className={cn(
                  "w-6 h-6 rounded border font-display text-xs font-semibold transition-colors",
                  pcTier === t
                    ? "bg-gold text-background border-gold"
                    : "bg-input text-muted-foreground border-border-strong hover:text-gold hover:border-gold/40"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ChatLayout
      header={header}
      scrollRef={scrollRef}
      placeholder={isLoading ? "Thinking..." : "Describe the encounter you want..."}
      isLoading={isLoading}
      onSubmit={handleSubmit}
    >
      {messages.map((message) => {
        const proposal = message.role === "assistant"
          ? getToolResultFromMessage(message, "propose_encounter", parseProposalFromToolCall)
          : null
        const adversaryCard = message.role === "assistant"
          ? getToolResultFromMessage(message, "create_adversary", parseAdversaryFromToolCall)
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
            {proposal?.data && (
              <EncounterProposal
                data={proposal.data}
                pcCount={pcCount}
                onAccept={(data) => handleAccept(message.id, data.name, data.adversaries as Adversary[])}
                accepted={acceptedProposals.has(message.id)}
              />
            )}
            {proposal && !proposal.data && (
              <div className="dh-feat-card text-sm text-muted-foreground animate-pulse">
                Building encounter…
              </div>
            )}
            {adversaryCard?.data && (
              <AdversarySummaryCard
                data={adversaryCard.data}
                onAddToEncounter={(adv) => handleAddAdversary(message.id, adv)}
                accepted={acceptedProposals.has(message.id)}
              />
            )}
            {adversaryCard && !adversaryCard.data && (
              <div className="dh-feat-card text-sm text-muted-foreground animate-pulse">
                Designing adversary…
              </div>
            )}
          </div>
        )
      })}
      {isLoading && <TypingIndicator />}
    </ChatLayout>
  )
}
