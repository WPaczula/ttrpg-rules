# Clerk Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the frontend's password gate with Clerk authentication, using middleware-based route protection and a custom sign-in form.

**Architecture:** Install `@clerk/nextjs`, add Clerk middleware to protect all routes (public: `/sign-in`), wrap app in `<ClerkProvider>`, build custom sign-in page with `useSignIn` hook, strip out old auth code, add sign-out button and auth-aware fetch utility.

**Tech Stack:** Next.js 16, @clerk/nextjs, React 19

---

### Task 1: Install @clerk/nextjs and configure environment

**Files:**
- Modify: `web/package.json`
- Modify: `web/.env`

- [ ] **Step 1: Install the package**

```bash
cd web && npm install @clerk/nextjs
```

- [ ] **Step 2: Update .env**

Add `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (the Clerk keys are already present). Remove `ACCESS_PASSWORD`.

The `.env` file should look like:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
SERVER_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env
git commit -m "chore: install @clerk/nextjs and configure env"
```

---

### Task 2: Add Clerk middleware

**Files:**
- Create: `web/middleware.ts`

- [ ] **Step 1: Create middleware file**

Create `web/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Clerk middleware for route protection"
```

---

### Task 3: Wrap app in ClerkProvider

**Files:**
- Modify: `web/app/layout.tsx`

- [ ] **Step 1: Add ClerkProvider to layout**

Modify `web/app/layout.tsx`. Add the import and wrap `{children}` in `<ClerkProvider>`:

```typescript
import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cinzel } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
}

export const metadata: Metadata = {
  title: 'TTRPG Character Creator',
  description: 'Create your character with an AI-powered assistant',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans antialiased`}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap app in ClerkProvider"
```

---

### Task 4: Create custom sign-in page

**Files:**
- Create: `web/app/sign-in/[[...sign-in]]/page.tsx`

Note: Clerk expects a catch-all route segment `[[...sign-in]]` to handle multi-step sign-in flows.

- [ ] **Step 1: Create the sign-in page**

Create `web/app/sign-in/[[...sign-in]]/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords, Lock, User } from "lucide-react"

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn.create({
        identifier: username,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/")
      } else {
        setError("Sign-in could not be completed. Please try again.")
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ longMessage?: string }> }
      const message = clerkError.errors?.[0]?.longMessage || "Invalid credentials. Please try again."
      setError(message)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
            <Swords className="w-8 h-8 text-gold" />
          </div>
          <CardTitle className="text-2xl font-sans text-gold">Character Creator</CardTitle>
          <CardDescription className="text-muted-foreground">
            This tool is invite-only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/sign-in/
git commit -m "feat: add custom Clerk sign-in page"
```

---

### Task 5: Create auth-aware fetch utility

**Files:**
- Create: `web/lib/api.ts`

- [ ] **Step 1: Create the utility**

Create `web/lib/api.ts`:

```typescript
import { useAuth } from '@clerk/nextjs'
import { useCallback } from 'react'

export function useAuthFetch() {
  const { getToken } = useAuth()

  return useCallback(
    async (url: string, options?: RequestInit) => {
      const token = await getToken()
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    },
    [getToken],
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add useAuthFetch utility for token-bearing requests"
```

---

### Task 6: Strip old auth and add sign-out button to main page

**Files:**
- Modify: `web/app/page.tsx`
- Delete: `web/lib/auth.ts`
- Delete: `web/app/api/auth/route.ts`
- Delete: `web/components/access-gate.tsx`

- [ ] **Step 1: Update page.tsx**

Remove all auth-related code and add a sign-out button. The updated file:

```tsx
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
```

- [ ] **Step 2: Delete old auth files**

```bash
rm lib/auth.ts
rm app/api/auth/route.ts
rm components/access-gate.tsx
```

- [ ] **Step 3: Commit**

```bash
git add -A app/page.tsx lib/auth.ts app/api/auth/route.ts components/access-gate.tsx
git commit -m "feat: replace password gate with Clerk auth, add sign-out button"
```

---

### Task 7: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
cd web && npm run dev
```

- [ ] **Step 2: Test unauthenticated redirect**

Open `http://localhost:3000` in a browser. Verify it redirects to `/sign-in`.

- [ ] **Step 3: Test sign-in**

Enter valid username + password (from a Clerk dashboard user). Verify it redirects to `/` and the app loads.

- [ ] **Step 4: Test invalid credentials**

Try signing in with wrong credentials. Verify an error message appears.

- [ ] **Step 5: Test sign-out**

Click the sign-out button (LogOut icon in header). Verify it redirects back to `/sign-in`.

- [ ] **Step 6: Test app functionality**

Verify tabs (Creator, Sheet, Lvl Up, Rules, Adversaries, Loot) and role switching (PC/GM) work as before.

- [ ] **Step 7: Test token in requests**

Open browser DevTools Network tab. Trigger an API call (e.g. use the Rules chat). Check that the `Authorization: Bearer <token>` header is present on outgoing requests (this will only apply once components start using `useAuthFetch`; for now, verify the utility exists and the app doesn't error).
