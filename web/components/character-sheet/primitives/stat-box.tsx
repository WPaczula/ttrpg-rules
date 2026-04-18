"use client"

interface StatBoxProps {
  label: string
  value: number | string
  sub?: string
}

export function StatBox({ label, value, sub }: StatBoxProps) {
  return (
    <div className="dh-hex">
      <span className="dh-hex-label">{label}</span>
      <span className="dh-hex-value">{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground mt-0.5">{sub}</span>}
    </div>
  )
}
