"use client"

import { Toaster } from "@/components/ui/sonner"

import { useState, useEffect } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"


export default function Home() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    console.log("[v0] Page mounted, checking for token")
    // Check for token in URL
    const url = new URL(window.location.href)
    const token = url.searchParams.get("token")
    console.log("[v0] Token found:", token)
    
    if (token && token.length >= 4) {
      console.log("[v0] Valid token, granting access")
      setHasAccess(true)
    } else {
      console.log("[v0] No valid token, showing access gate")
      setHasAccess(false)
    }
  }, [])

  // Loading state
  if (hasAccess === null) {
    console.log("[v0] Rendering loading state")
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  console.log("[v0] Rendering main content, hasAccess:", hasAccess)

  return (
    <>
      {hasAccess ? (
        <ChatInterface />
      ) : (
        <AccessGate onValidToken={() => setHasAccess(true)} dmName="your DM" />
      )}
    </>
  )
}
