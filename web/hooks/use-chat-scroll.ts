import { useEffect, type RefObject } from "react"
import type { UIMessage } from "@ai-sdk/react"

/** Auto-scroll chat on new user message and on tab becoming active */
export function useChatScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  messages: UIMessage[],
  isActive?: boolean,
) {
  // Scroll smoothly when user sends a message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "user") {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages.length, scrollRef])

  // Jump to bottom when tab becomes active
  useEffect(() => {
    if (isActive) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "instant",
      })
    }
  }, [isActive, scrollRef])
}
