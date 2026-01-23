"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "bot" | "user"
  content: string
}

// Simple markdown parser for basic formatting
function parseMarkdown(content: string) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let inList = false
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 text-foreground/90">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm">
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      )
      listItems = []
      inList = false
    }
  }

  const formatInline = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gold font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Headings
    if (line.startsWith("# ")) {
      flushList()
      elements.push(
        <h1 key={i} className="text-xl font-sans font-semibold text-gold mb-3 mt-2">
          {line.slice(2)}
        </h1>
      )
      continue
    }

    // Numbered list items
    const listMatch = line.match(/^\d+\.\s*(.+)/)
    if (listMatch) {
      inList = true
      listItems.push(listMatch[1])
      continue
    }

    // Empty line or new paragraph
    if (line.trim() === "") {
      flushList()
      continue
    }

    // Regular paragraph
    flushList()
    elements.push(
      <p key={i} className="text-sm leading-relaxed text-foreground/90 mb-2">
        <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      </p>
    )
  }

  flushList()
  return elements
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isBot = role === "bot"

  return (
    <div
      className={cn(
        "flex w-full",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-3",
          isBot
            ? "bg-card border border-border shadow-[0_0_15px_rgba(139,92,246,0.1)]"
            : "bg-gold/20 border border-gold/30 text-foreground"
        )}
      >
        {isBot && content ? (
          <div className="max-w-none">
            {parseMarkdown(content)}
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  )
}
