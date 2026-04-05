"use client"

interface StatBoxProps {
  label: string
  value: number | string
  sub?: string
}

export function StatBox({ label, value, sub }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-purple-deep/50 border border-border rounded-lg p-3 min-w-[72px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-xl font-bold text-gold">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}
