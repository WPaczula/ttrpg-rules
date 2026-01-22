"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords, Lock } from "lucide-react"

interface AccessGateProps {
  onValidToken: () => void
  dmName?: string
}

export function AccessGate({ onValidToken, dmName = "the GM at wojciech.paczul@gmail.com" }: AccessGateProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  console.log("[v0] AccessGate rendering")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate validation - in production this would check against a backend
    setTimeout(() => {
      if (code.length >= 4) {
        // Store token in URL or localStorage
        const url = new URL(window.location.href)
        url.searchParams.set("token", code)
        window.history.replaceState({}, "", url.toString())
        onValidToken()
      } else {
        setError("Invalid access code. Please try again.")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
            <Swords className="w-8 h-8 text-gold" />
          </div>
          <CardTitle className="text-2xl font-sans text-gold">Daggerheart Character Creator</CardTitle>
          <CardDescription className="text-muted-foreground">
            This tool is invite-only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Enter your access code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !code}
              className="w-full bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Enter"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Need access? Contact {dmName}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
