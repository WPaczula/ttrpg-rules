"use client"

import { useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { getMessageContent, makeWelcomeMessage } from "@/lib/chat-messages"
import { createChatStorage } from "@/lib/chat-storage"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import { ChatLayout } from "@/components/chat-layout"
import { BookOpen } from "lucide-react"

const WELCOME_TEXT = `# Rules Reference

I'm your Daggerheart rules assistant. Ask me anything about the game mechanics, classes, adversaries, items, or any other rules questions.

**What would you like to know?** I'll search the SRD to find accurate answers.

*Type /clear to start fresh.*`

const storage = createChatStorage(
  "daggerheart-rules-chat",
  () => makeWelcomeMessage(WELCOME_TEXT),
)

interface RulesChatProps {
  isActive?: boolean
}

export function RulesChat({ isActive }: RulesChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/rules-chat" }),
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

  const handleSubmit = (value: string) => {
    if (value.toLowerCase() === "/clear") {
      storage.clear()
      setMessages([makeWelcomeMessage(WELCOME_TEXT)])
      return
    }
    sendMessage({ text: value })
  }

  const header = (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
          <BookOpen className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="font-sans font-semibold text-gold text-lg">Rules Reference</h1>
          <p className="text-xs text-muted-foreground">Daggerheart SRD</p>
        </div>
      </div>
    </header>
  )

  return (
    <ChatLayout
      header={header}
      scrollRef={scrollRef}
      placeholder={isLoading ? "Searching rules..." : "Ask about rules..."}
      isLoading={isLoading}
      onSubmit={handleSubmit}
    >
      {messages.map((message) => {
        const textContent = getMessageContent(message)
        if (!textContent) return null
        return (
          <ChatMessage
            key={message.id}
            role={message.role === "assistant" ? "bot" : "user"}
            content={textContent}
          />
        )
      })}
      {isLoading && <TypingIndicator />}
    </ChatLayout>
  )
}
