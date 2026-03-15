import type { UIMessage } from "@ai-sdk/react"

interface ChatStorageBase {
  load: () => UIMessage[]
  save: (messages: UIMessage[]) => void
  clear: () => void
}

interface ChatStorageWithAccepted extends ChatStorageBase {
  loadAccepted: () => Set<string>
  saveAccepted: (accepted: Set<string>) => void
}

export function createChatStorage(
  storageKey: string,
  makeWelcome: () => UIMessage,
): ChatStorageBase
export function createChatStorage(
  storageKey: string,
  makeWelcome: () => UIMessage,
  acceptedKey: string,
): ChatStorageWithAccepted
export function createChatStorage(
  storageKey: string,
  makeWelcome: () => UIMessage,
  acceptedKey?: string,
): ChatStorageBase | ChatStorageWithAccepted {
  const load = (): UIMessage[] => {
    if (typeof window === "undefined") return [makeWelcome()]
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch { /* ignore */ }
    return [makeWelcome()]
  }

  const save = (messages: UIMessage[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch { /* ignore */ }
  }

  const clear = () => {
    try {
      localStorage.removeItem(storageKey)
      if (acceptedKey) localStorage.removeItem(acceptedKey)
    } catch { /* ignore */ }
  }

  if (!acceptedKey) return { load, save, clear }

  const loadAccepted = (): Set<string> => {
    if (typeof window === "undefined") return new Set()
    try {
      const saved = localStorage.getItem(acceptedKey)
      if (saved) return new Set(JSON.parse(saved))
    } catch { /* ignore */ }
    return new Set()
  }

  const saveAccepted = (accepted: Set<string>) => {
    try {
      localStorage.setItem(acceptedKey, JSON.stringify([...accepted]))
    } catch { /* ignore */ }
  }

  return { load, save, clear, loadAccepted, saveAccepted }
}
