"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { OptionButtons } from "@/components/option-buttons"
import { CharacterSheet, type CharacterData } from "@/components/character-sheet"
import { Send, Swords, Scroll } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface Message {
  id: string
  role: "bot" | "user"
  content: string
  options?: string[]
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "bot",
  content: `# Welcome, Adventurer!

I'm here to help you create your **Daggerheart** character. Together, we'll craft a hero with a compelling story and abilities that match your vision.

Let's start with the most important question:

**What kind of character do you want to play?**

1. **A fierce warrior** - frontline fighter, protector
2. **A cunning rogue** - stealthy, quick, clever
3. **A powerful mage** - wielder of arcane forces
4. **A divine champion** - blessed by the gods
5. **Something else** - tell me your idea!`,
  options: ["A fierce warrior", "A cunning rogue", "A powerful mage", "A divine champion", "Something else"],
}

// Determine class from user choice
function getClassFromChoice(choice: string): string {
  const lower = choice.toLowerCase()
  if (lower.includes("warrior") || lower.includes("fighter") || lower.includes("frontline") || lower.includes("combat")) return "Warrior"
  if (lower.includes("rogue") || lower.includes("stealth") || lower.includes("cunning") || lower.includes("subterfuge")) return "Rogue"
  if (lower.includes("mage") || lower.includes("arcane") || lower.includes("magic") || lower.includes("spellcasting")) return "Mage"
  if (lower.includes("divine") || lower.includes("champion") || lower.includes("god") || lower.includes("support") || lower.includes("healing")) return "Divine Champion"
  return "Adventurer"
}

// Simulated bot responses based on user choice
function getBotResponse(userMessage: string, messageCount: number): Message {
  const lowerMessage = userMessage.toLowerCase()
  
  if (messageCount === 1) {
    // First response - class selection
    if (lowerMessage.includes("warrior") || lowerMessage.includes("fighter") || lowerMessage.includes("frontline") || lowerMessage.includes("combat")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: `# Excellent Choice!

The path of the **Warrior** is noble and demanding. You'll stand at the front, protecting your allies and striking down foes.

Now, let's choose your **Warrior Subclass**:

1. **Guardian** - Defensive master, shields allies from harm
2. **Berserker** - Unleash fury for devastating attacks
3. **Warden** - Nature-bonded protector of the wilds
4. **Knight** - Honorable combatant with tactical prowess`,
        options: ["Guardian", "Berserker", "Warden", "Knight"],
      }
    }
    if (lowerMessage.includes("rogue") || lowerMessage.includes("stealth") || lowerMessage.includes("cunning") || lowerMessage.includes("subterfuge")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: `# A Shadow Awaits!

The **Rogue's** path rewards cunning, agility, and striking when least expected. Enemies won't see you coming.

Choose your **Rogue Subclass**:

1. **Assassin** - Master of the killing blow
2. **Thief** - Unparalleled skills in acquisition
3. **Scout** - Expert tracker and survivalist
4. **Trickster** - Illusions and misdirection`,
        options: ["Assassin", "Thief", "Scout", "Trickster"],
      }
    }
    if (lowerMessage.includes("mage") || lowerMessage.includes("arcane") || lowerMessage.includes("magic") || lowerMessage.includes("spellcasting")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: `# The Arcane Beckons!

As a **Mage**, you'll bend reality to your will. Raw power flows through your very being.

Select your **Mage Subclass**:

1. **Elementalist** - Command fire, ice, lightning, and earth
2. **Enchanter** - Control minds and manipulate emotions
3. **Necromancer** - Draw power from death itself
4. **Chronomancer** - Bend the flow of time`,
        options: ["Elementalist", "Enchanter", "Necromancer", "Chronomancer"],
      }
    }
    if (lowerMessage.includes("divine") || lowerMessage.includes("champion") || lowerMessage.includes("god") || lowerMessage.includes("support") || lowerMessage.includes("healing")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: `# The Gods Smile Upon You!

A **Divine Champion** channels sacred power to heal allies and smite the wicked.

Choose your **Divine Path**:

1. **Paladin** - Holy warrior, radiant and righteous
2. **Cleric** - Healer and conduit of divine will
3. **Zealot** - Fanatical devotee with unshakeable faith
4. **Oracle** - Seer blessed with prophetic visions`,
        options: ["Paladin", "Cleric", "Zealot", "Oracle"],
      }
    }
    // Default for "something else"
    return {
      id: Date.now().toString(),
      role: "bot",
      content: `# Interesting!

Tell me more about your character concept. What kind of abilities or playstyle interests you? I can help match you with the perfect class and subclass combination.

Are you looking for:
1. **Combat-focused** abilities
2. **Support and healing** capabilities
3. **Stealth and subterfuge**
4. **Magic and spellcasting**`,
      options: ["Combat-focused", "Support and healing", "Stealth and subterfuge", "Magic and spellcasting"],
    }
  }
  
  if (messageCount === 2) {
    // Second response - ancestry selection
    return {
      id: Date.now().toString(),
      role: "bot",
      content: `# Great choice: **${userMessage}**!

That subclass will serve you well. Now let's determine your **Ancestry** - where you come from shapes who you are.

Choose your **Ancestry**:

1. **Human** - Versatile and ambitious, found everywhere
2. **Elf** - Ancient, graceful, connected to nature
3. **Dwarf** - Sturdy, determined, masters of craft
4. **Halfling** - Lucky, brave, community-minded
5. **Orc** - Strong, honorable, tribal warriors`,
      options: ["Human", "Elf", "Dwarf", "Halfling", "Orc"],
    }
  }
  
  if (messageCount === 3) {
    // Third response - community
    return {
      id: Date.now().toString(),
      role: "bot",
      content: `# **${userMessage}** - A proud heritage!

Your ancestry grants you unique abilities and perspectives. Now, let's determine your **Community** - where you grew up.

Select your **Community**:

1. **Urban** - Raised in a bustling city
2. **Rural** - From a quiet village or farmland
3. **Nomadic** - Traveled constantly, home is the road
4. **Wilderness** - Grew up in untamed lands
5. **Noble** - Born into wealth and privilege`,
      options: ["Urban", "Rural", "Nomadic", "Wilderness", "Noble"],
    }
  }
  
  if (messageCount === 4) {
    // Fourth response - name
    return {
      id: Date.now().toString(),
      role: "bot",
      content: `# Community: **${userMessage}**

Your background shapes your worldview and skills. Now for the most personal choice...

**What is your character's name?**

Type any name you'd like, or I can suggest some options based on your ancestry!`,
    }
  }
  
  if (messageCount >= 5) {
    // Final summary
    return {
      id: Date.now().toString(),
      role: "bot",
      content: `# Your character is complete!

**${userMessage}** is ready to adventure in Daggerheart!

Use the character sheet panel to review your choices and export your character when ready.

Would you like to:
1. **Start over** with a new character
2. **Refine** any of your choices
3. **Learn more** about your abilities`,
      options: ["Start over", "Refine choices", "Learn more"],
    }
  }
  
  return {
    id: Date.now().toString(),
    role: "bot",
    content: "I understand. Let me help you with that choice...",
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [character, setCharacter] = useState<CharacterData>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  
  console.log("[v0] ChatInterface rendering, messages:", messages.length)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = (content: string) => {
    if (!content.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    }

    const userMessageCount = messages.filter((m) => m.role === "user").length + 1
    
    // Update character based on step
    setCharacter((prev) => {
      const updated = { ...prev }
      if (userMessageCount === 1) {
        updated.class = getClassFromChoice(content)
      } else if (userMessageCount === 2) {
        updated.subclass = content.trim()
      } else if (userMessageCount === 3) {
        updated.ancestry = content.trim()
      } else if (userMessageCount === 4) {
        updated.community = content.trim()
      } else if (userMessageCount === 5) {
        updated.name = content.trim()
      }
      return updated
    })

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = getBotResponse(content, userMessageCount)
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleOptionSelect = (option: string) => {
    sendMessage(option)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
              <Swords className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-sans font-semibold text-gold text-lg">Daggerheart</h1>
              <p className="text-xs text-muted-foreground">Character Creator</p>
            </div>
          </div>
          
          {/* Mobile Character Sheet Toggle */}
          {isMobile ? (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-gold/40 text-gold hover:bg-gold/10 bg-transparent">
                  <Scroll className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] p-0 bg-card border-border [&>button]:hidden">
                <CharacterSheet character={character} onClose={() => setSheetOpen(false)} showClose />
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(!sheetOpen)}
              className="border-gold/40 text-gold hover:bg-gold/10 gap-2 bg-transparent"
            >
              <Scroll className="w-4 h-4" />
              Character Sheet
            </Button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div key={message.id}>
                <ChatMessage role={message.role} content={message.content} />
                {/* Show options only for the last bot message */}
                {message.role === "bot" &&
                  index === messages.length - 1 &&
                  message.options &&
                  message.options.length > 0 && (
                    <div className="mt-2 ml-0">
                      <OptionButtons
                        options={message.options}
                        onSelect={handleOptionSelect}
                        disabled={isTyping}
                      />
                    </div>
                  )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTyping ? "Thinking..." : "Describe what you're looking for..."}
              disabled={isTyping}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
            />
            <Button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Desktop Character Sheet Sidebar */}
      {!isMobile && sheetOpen && (
        <div className="w-80 border-l border-border">
          <CharacterSheet character={character} onClose={() => setSheetOpen(false)} showClose />
        </div>
      )}
    </div>
  )
}
