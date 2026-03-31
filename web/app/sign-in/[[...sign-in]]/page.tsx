"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords, Lock, User } from "lucide-react"

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const emailAddress = formData.get("username") as string
    const password = formData.get("password") as string

    const { error } = await signIn.password({
      emailAddress,
      password,
    })

    if (error) return

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl("/")
          if (url.startsWith("http")) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
            <Swords className="w-8 h-8 text-gold" />
          </div>
          <CardTitle className="text-2xl font-sans text-gold">DH helper</CardTitle>
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
                name="username"
                type="text"
                placeholder="Enter username..."
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
                name="password"
                type="password"
                placeholder="Enter password..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
              />
              {errors?.fields?.password && (
                <p className="text-destructive text-sm">{errors.fields.password.message}</p>
              )}
              {errors?.fields?.identifier && (
                <p className="text-destructive text-sm">{errors.fields.identifier.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={fetchStatus === "fetching"}
              className="w-full bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              {fetchStatus === "fetching" ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
