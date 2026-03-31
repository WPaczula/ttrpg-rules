"use client"

import { useState, useCallback } from "react"
import { useClerk } from "@clerk/nextjs"
import { ChatInterface } from "@/components/chat-interface"
import { CharacterSheetTab } from "@/components/character-sheet-tab"
import { EncounterTab } from "@/components/encounter-tab"
import { LevelUpTab } from "@/components/level-up-tab"
import { LootTab } from "@/components/loot-tab"
import { RulesChat } from "@/components/rules-chat"
import { useCharacterSheet } from "@/hooks/use-character-sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import type { CharacterData } from "@/lib/character-types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Scroll, Swords, BookOpen, User, Shield, Dices, ArrowUpCircle, LogOut } from "lucide-react"

type Role = "pc" | "gm"

const ROLE_KEY = "daggerheart-role"

function loadRole(): Role {
  if (typeof window === "undefined") return "pc"
  return (localStorage.getItem(ROLE_KEY) as Role) || "pc"
}

const pcTabs = [
  { value: "chat", icon: MessageSquare, label: "Creator" },
  { value: "sheet", icon: Scroll, label: "Sheet" },
  { value: "levelup", icon: ArrowUpCircle, label: "Lvl Up" },
] as const

const gmTabs = [
  { value: "rules", icon: BookOpen, label: "Rules" },
  { value: "adversaries", icon: Swords, label: "Adversaries" },
  { value: "loot", icon: Dices, label: "Loot" },
] as const

export default function Home() {
  const { signOut } = useClerk()
  const [role, setRole] = useState<Role>(loadRole)
  const [activeTab, setActiveTab] = useState(() => (loadRole() === "gm" ? "rules" : "chat"))
  const { character, setCharacter, resetCharacter, isLoaded } = useCharacterSheet()
  const isMobile = useIsMobile()

  const handleRoleChange = useCallback((newRole: Role) => {
    setRole(newRole)
    localStorage.setItem(ROLE_KEY, newRole)
    setActiveTab(newRole === "gm" ? "rules" : "chat")
  }, [])

  const handleApplyCharacter = useCallback((data: CharacterData) => {
    setCharacter(data)
    setActiveTab("sheet")
  }, [setCharacter])

  const tabs = role === "pc" ? pcTabs : gmTabs

  const desktopTriggerClass = "gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-transparent transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30"

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col h-dvh bg-background gap-0"
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-3 h-11">
        <span className="text-xs text-muted-foreground font-medium">Daggerheart</span>

        {/* Desktop: nav links in header */}
        <TabsList className="hidden md:inline-flex h-auto bg-transparent rounded-none border-none p-0 gap-1">
          {tabs.map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value} className={desktopTriggerClass}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleRoleChange("pc")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-l-md text-xs font-medium border transition-colors ${
              role === "pc"
                ? "bg-gold/15 text-gold border-gold/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            PC
          </button>
          <button
            onClick={() => handleRoleChange("gm")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-r-md text-xs font-medium border border-l-0 transition-colors ${
              role === "gm"
                ? "bg-gold/15 text-gold border-gold/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            GM
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-1"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PC tabs */}
      <TabsContent value="chat" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
        <ChatInterface isActive={activeTab === "chat"} onApplyCharacter={handleApplyCharacter} />
      </TabsContent>

      <TabsContent value="sheet" className="flex-1 min-h-0 mt-0 overflow-y-auto data-[state=inactive]:hidden">
        <CharacterSheetTab
          character={character}
          setCharacter={setCharacter}
          resetCharacter={resetCharacter}
          isLoaded={isLoaded}
        />
      </TabsContent>

      <TabsContent value="levelup" className="flex-1 min-h-0 mt-0 overflow-y-auto data-[state=inactive]:hidden">
        <LevelUpTab
          character={character}
          setCharacter={setCharacter}
          isLoaded={isLoaded}
        />
      </TabsContent>

      {/* GM tabs */}
      <TabsContent value="rules" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
        <RulesChat isActive={activeTab === "rules"} />
      </TabsContent>

      <TabsContent value="adversaries" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
        <EncounterTab />
      </TabsContent>

      <TabsContent value="loot" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
        <LootTab />
      </TabsContent>

      {/* Mobile: bottom navigation */}
      {isMobile && (
        <nav className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-stretch justify-around">
            {tabs.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                  activeTab === value
                    ? "text-gold"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </Tabs>
  )
}
