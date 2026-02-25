"use client"

import { useState } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"
import { CharacterSheetTab } from "@/components/character-sheet-tab"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Scroll } from "lucide-react"

export default function Home() {
  const [password, setPassword] = useState<string | null>(null)

  if (!password) {
    return <AccessGate onValidPassword={setPassword} />
  }

  return (
    <Tabs
      defaultValue="chat"
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
      </TabsList>

      <TabsContent value="chat" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
        <ChatInterface password={password} />
      </TabsContent>

      <TabsContent value="sheet" className="flex-1 min-h-0 mt-0 overflow-y-auto data-[state=inactive]:hidden">
        <CharacterSheetTab />
      </TabsContent>
    </Tabs>
  )
}
