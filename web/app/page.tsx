"use client"

import { useState, useEffect, useCallback } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"
import { CharacterSheetTab } from "@/components/character-sheet-tab"
import { EncounterTab } from "@/components/encounter-tab"
import { useCharacterSheet } from "@/hooks/use-character-sheet"
import type { CharacterData } from "@/lib/character-types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Scroll, Swords } from "lucide-react"

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const { character, setCharacter, resetCharacter, isLoaded } = useCharacterSheet()

  useEffect(() => {
    fetch('/api/auth')
      .then(res => setAuthenticated(res.ok))
      .catch(() => setAuthenticated(false))
  }, [])

  const handleApplyCharacter = useCallback((data: CharacterData) => {
    setCharacter(data)
    setActiveTab("sheet")
  }, [setCharacter])

  if (authenticated === null) {
    return null
  }

  if (!authenticated) {
    return <AccessGate onValidPassword={() => setAuthenticated(true)} />
  }

  return (
    <Tabs
      value={activeTab}
      defaultValue="chat"
      onValueChange={setActiveTab}
      className="flex flex-col h-dvh bg-background gap-0"
    >
      <TabsList className="shrink-0 w-full rounded-none border-b border-border bg-card/80 backdrop-blur-sm h-12 justify-start gap-1 px-2 p-1.5">
        <TabsTrigger
          value="chat"
          className="gap-1.5 data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30"
        >
          <MessageSquare className="w-4 h-4" />
          Creator
        </TabsTrigger>
        <TabsTrigger
          value="sheet"
          className="gap-1.5 data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30"
        >
          <Scroll className="w-4 h-4" />
          Character Sheet
        </TabsTrigger>
        <TabsTrigger
          value="adversaries"
          className="gap-1.5 data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30"
        >
          <Swords className="w-4 h-4" />
          Adversaries
        </TabsTrigger>
      </TabsList>

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

      <TabsContent value="adversaries" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
        <EncounterTab />
      </TabsContent>
    </Tabs>
  )
}
