"use client"

export function TypingIndicator() {
  return (
    <div className="flex justify-start w-full">
      <div className="dh-domain-card shadow-[0_0_15px_rgba(139,92,246,0.1)]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gold-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-gold-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-gold-muted rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}
