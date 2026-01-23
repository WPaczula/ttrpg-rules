"use client"

import { useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { Send, Swords } from "lucide-react"

interface ChatInterfaceProps {
  password: string
}

const INITIAL_MESSAGE = `# Welcome, Adventurer!

I'm here to help you create your character. Together, we'll craft a hero with a compelling story and abilities that match your vision.

**What kind of character would you like to play?** Tell me about the concept you have in mind, or I can show you the available classes to help you decide!`

export function ChatInterface({ password }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { password },
      }),
    [password]
  )

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        content: INITIAL_MESSAGE,
        parts: [{ type: "text", text: INITIAL_MESSAGE }],
      },
    ],
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    if (input.value.trim() && !isLoading) {
      sendMessage({ text: input.value.trim() })
      input.value = ""
    }
  }

  return (
    <div className="flex h-screen bg-background">
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
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role === "assistant" ? "bot" : "user"}
                content={message.content}
              />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              name="message"
              placeholder={isLoading ? "Thinking..." : "Type your message..."}
              disabled={isLoading}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Attribution Footer */}
        <footer className="px-4 py-2 text-center text-xs text-muted-foreground border-t border-border">
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
