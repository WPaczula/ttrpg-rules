import { SyncStatus } from "./types"

interface QueueEntry {
  key: string
  fn: () => Promise<void>
  retries: number
}

const MAX_RETRIES = 2
const BASE_DELAY_MS = 1000

export class SyncEngine {
  private readonly queue = new Map<string, QueueEntry>()
  private readonly status = new Map<string, SyncStatus>()
  private running = false

  enqueue(key: string, fn: () => Promise<void>): void {
    this.queue.set(key, { key, fn, retries: 0 })
    this.setStatus(key, "idle")
    if (!this.running) this.drain()
  }

  getStatus(key: string): SyncStatus {
    return this.status.get(key) ?? "idle"
  }

  private setStatus(key: string, status: SyncStatus): void {
    this.status.set(key, status)
  }

  private async drain(): Promise<void> {
    this.running = true
    while (this.queue.size > 0) {
      const [key, entry] = this.queue.entries().next().value as [string, QueueEntry]
      this.queue.delete(key)
      await this.execute(entry)
    }
    this.running = false
  }

  private async execute(entry: QueueEntry): Promise<void> {
    this.setStatus(entry.key, "syncing")
    try {
      await entry.fn()
      this.setStatus(entry.key, "success")
    } catch {
      if (entry.retries < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, entry.retries)
        await new Promise((resolve) => setTimeout(resolve, delay))
        await this.execute({ ...entry, retries: entry.retries + 1 })
      } else {
        this.setStatus(entry.key, "error")
        // Errors are intentionally swallowed — sync failure must never affect UI
      }
    }
  }
}

/** Singleton engine shared across the app */
export const syncEngine = new SyncEngine()
