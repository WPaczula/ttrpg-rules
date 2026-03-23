import type { UIMessage } from "@ai-sdk/react"

/** Extract text content from AI SDK v6 message parts */
export function getMessageContent(message: UIMessage): string {
  // Legacy welcome messages may have a `content` field
  const legacy = (message as any).content
  if (legacy) return legacy

  if (!message.parts) return ""
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
}

/** Extract tool output from a message part */
export function getToolOutput(part: unknown): string | null {
  const p = part as any
  if (p.state !== "output-available" || p.output == null) return null
  return typeof p.output === "string" ? p.output : JSON.stringify(p.output)
}

/**
 * Find a tool result in a message by tool name and parse it.
 * Returns { data, state } if the tool part exists, null otherwise.
 */
export function getToolResultFromMessage<T>(
  message: UIMessage,
  toolName: string,
  parser: (output: string) => T | null,
): { data: T | null; state: string } | null {
  if (!message.parts) return null
  for (const part of message.parts) {
    if ((part as any).type === `tool-${toolName}`) {
      const output = getToolOutput(part)
      if (output != null) {
        const data = parser(output)
        return data ? { data, state: "output-available" } : null
      }
      return { data: null, state: (part as any).state ?? "input-streaming" }
    }
  }
  return null
}

/** Create a welcome message with the given text */
export function makeWelcomeMessage(text: string) {
  return {
    id: "welcome",
    role: "assistant" as const,
    content: text,
    parts: [{ type: "text" as const, text }],
  }
}
