"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon, ChevronsUpDown, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ComboboxItem {
  value: string
  label: string
  detail?: string
  group?: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  value: string
  onSelect: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  /** Render a custom preview below the selected item label */
  renderDetail?: (item: ComboboxItem) => React.ReactNode
}

export function Combobox({
  items,
  value,
  onSelect,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  className,
  renderDetail,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selected = items.find((i) => i.value === value)

  // Group items if they have groups
  const groups = React.useMemo(() => {
    const map = new Map<string, ComboboxItem[]>()
    for (const item of items) {
      const g = item.group || ""
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    }
    return map
  }, [items])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground",
            "hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-gold transition-colors",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        side="bottom"
        avoidCollisions
      >
        <CommandPrimitive
          className="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
          shouldFilter={true}
        >
          <div className="flex items-center gap-2 border-b border-border px-3 h-9">
            <SearchIcon className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder={searchPlaceholder}
              className="placeholder:text-muted-foreground flex h-full w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandPrimitive.List className="max-h-[240px] overflow-y-auto overflow-x-hidden scroll-py-1">
            <CommandPrimitive.Empty className="py-4 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </CommandPrimitive.Empty>
            {[...groups.entries()].map(([group, groupItems]) => (
              <CommandPrimitive.Group
                key={group}
                heading={group || undefined}
                className={cn(
                  "overflow-hidden p-1",
                  group && "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                )}
              >
                {groupItems.map((item) => (
                  <CommandPrimitive.Item
                    key={item.value}
                    value={`${item.label} ${item.detail || ""}`}
                    onSelect={() => {
                      onSelect(item.value === value ? "" : item.value)
                      setOpen(false)
                      setSearch("")
                    }}
                    className="relative flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        item.value === value ? "opacity-100 text-gold" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">{item.label}</span>
                      {item.detail && (
                        <span className="text-xs text-muted-foreground truncate">
                          {item.detail}
                        </span>
                      )}
                      {renderDetail && item.value === value && renderDetail(item)}
                    </div>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  )
}
