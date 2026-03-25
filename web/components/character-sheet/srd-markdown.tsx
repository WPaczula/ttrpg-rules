import Markdown from "react-markdown"
import type { Components } from "react-markdown"

const components: Components = {
  p: ({ children }) => (
    <p className="text-xs text-muted-foreground leading-relaxed mb-1 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5 ml-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-xs text-muted-foreground leading-relaxed">{children}</li>
  ),
}

interface SrdMarkdownProps {
  children: string
  className?: string
}

export function SrdMarkdown({ children, className }: SrdMarkdownProps) {
  return (
    <div className={className}>
      <Markdown components={components}>{children}</Markdown>
    </div>
  )
}
