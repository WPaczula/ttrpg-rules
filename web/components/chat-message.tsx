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
  let inTable = false
  let tableRows: string[][] = []
  let tableHasHeader = false

  const formatInline = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gold font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  }

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

  const parseTableCells = (line: string): string[] =>
    line.split("|").map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1 || (arr[0] !== "" && i === 0) || (arr[arr.length - 1] !== "" && i === arr.length - 1)).filter(Boolean)

  const isTableSeparator = (line: string): boolean =>
    /^\|?[\s\-|:]+\|?$/.test(line) && line.includes("-")

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableHasHeader ? tableRows[0] : null
      const bodyRows = tableHasHeader ? tableRows.slice(1) : tableRows
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
          <table className="w-full text-sm border-collapse">
            {headerRow && (
              <thead>
                <tr className="border-b border-gold/30">
                  {headerRow.map((cell, i) => (
                    <th key={i} className="px-3 py-1.5 text-left font-semibold text-gold">
                      <span dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-foreground/90">
                      <span dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableRows = []
      inTable = false
      tableHasHeader = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList()
      flushTable()
      elements.push(
        <hr key={i} className="border-t border-border/60 my-3" />
      )
      continue
    }

    // H1 heading
    if (line.startsWith("# ")) {
      flushList()
      flushTable()
      elements.push(
        <h1 key={i} className="text-xl font-sans font-semibold text-gold mb-3 mt-2">
          {line.slice(2)}
        </h1>
      )
      continue
    }

    // H2 heading
    if (line.startsWith("## ")) {
      flushList()
      flushTable()
      elements.push(
        <h2 key={i} className="text-lg font-sans font-semibold text-gold mb-2 mt-3">
          {line.slice(3)}
        </h2>
      )
      continue
    }

    // H3 heading
    if (line.startsWith("### ")) {
      flushList()
      flushTable()
      elements.push(
        <h3 key={i} className="text-base font-sans font-semibold text-gold/80 mb-1 mt-2">
          {line.slice(4)}
        </h3>
      )
      continue
    }

    // Table rows
    if (line.includes("|")) {
      flushList()
      if (isTableSeparator(line)) {
        // This is the separator row — mark that next rows are body
        if (tableRows.length > 0) tableHasHeader = true
        continue
      }
      const cells = parseTableCells(line)
      if (cells.length > 0) {
        inTable = true
        tableRows.push(cells)
        continue
      }
    } else if (inTable) {
      flushTable()
    }

    // Numbered list items
    const listMatch = line.match(/^\d+\.\s*(.+)/)
    if (listMatch) {
      flushTable()
      inList = true
      listItems.push(listMatch[1])
      continue
    }

    // Empty line or new paragraph
    if (line.trim() === "") {
      flushList()
      flushTable()
      continue
    }

    // Regular paragraph
    flushList()
    flushTable()
    elements.push(
      <p key={i} className="text-sm leading-relaxed text-foreground/90 mb-2">
        <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      </p>
    )
  }

  flushList()
  flushTable()
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
