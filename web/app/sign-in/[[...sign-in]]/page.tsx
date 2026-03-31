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
