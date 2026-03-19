"use client"

import { useState, useEffect, useCallback } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"
import { CharacterSheetTab } from "@/components/character-sheet-tab"
import { EncounterTab } from "@/components/encounter-tab"
import { LootTab } from "@/components/loot-tab"
import { RulesChat } from "@/components/rules-chat"
import { useCharacterSheet } from "@/hooks/use-character-sheet"
import type { CharacterData } from "@/lib/character-types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Scroll, Swords, BookOpen, User, Shield, Dices } from "lucide-react"

type Role = "pc" | "gm"

const ROLE_KEY = "daggerheart-role"

function loadRole(): Role {
  if (typeof window === "undefined") return "pc"
  return (localStorage.getItem(ROLE_KEY) as Role) || "pc"
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [role, setRole] = useState<Role>(loadRole)
  const [activeTab, setActiveTab] = useState(() => (loadRole() === "gm" ? "rules" : "chat"))
  const { character, setCharacter, resetCharacter, isLoaded } = useCharacterSheet()

  useEffect(() => {
    fetch('/api/auth')
      .then(res => setAuthenticated(res.ok))
      .catch(() => setAuthenticated(false))
  }, [])

  const handleRoleChange = useCallback((newRole: Role) => {
    setRole(newRole)
    localStorage.setItem(ROLE_KEY, newRole)
    setActiveTab(newRole === "gm" ? "rules" : "chat")
  }, [])

  const handleApplyCharacter = useCallback((data: CharacterData) => {
    setCharacter(data)
    setActiveTab("sheet")
  }, [setCharacter])

  if (authenticated === null) return null

  if (!authenticated) {
    return <AccessGate onValidPassword={() => setAuthenticated(true)} />
  }

  const triggerClass = "gap-1.5 data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30"

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col h-dvh bg-background gap-0"
    >
      <TabsList className="shrink-0 w-full rounded-none border-b border-border bg-card/80 backdrop-blur-sm h-12 justify-start gap-1 px-2 p-1.5">
        {role === "pc" ? (
          <>
            <TabsTrigger value="chat" className={triggerClass}>
              <MessageSquare className="w-4 h-4" />
              Creator
            </TabsTrigger>
            <TabsTrigger value="sheet" className={triggerClass}>
              <Scroll className="w-4 h-4" />
              Character Sheet
            </TabsTrigger>
          </>
        ) : (
          <>
            <TabsTrigger value="rules" className={triggerClass}>
              <BookOpen className="w-4 h-4" />
              Rules Chat
            </TabsTrigger>
            <TabsTrigger value="adversaries" className={triggerClass}>
              <Swords className="w-4 h-4" />
              Adversaries
            </TabsTrigger>
            <TabsTrigger value="loot" className={triggerClass}>
              <Dices className="w-4 h-4" />
              Loot
            </TabsTrigger>
          </>
        )}

        {/* Role switcher */}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => handleRoleChange("pc")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-l-md text-xs font-medium border transition-colors ${
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
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-r-md text-xs font-medium border border-l-0 transition-colors ${
              role === "gm"
                ? "bg-gold/15 text-gold border-gold/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            GM
          </button>
        </div>
      </TabsList>

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
    </Tabs>
  )
}
