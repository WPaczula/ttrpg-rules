"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Swords, Lock, User, LogIn } from "lucide-react"

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
      <div className="w-full max-w-md">
        {/* ── Hex badge + title ─────────────────────────────────── */}
        <div className="flex flex-col items-center">
          <div className="dh-hex w-24 h-[96px] flex items-center justify-center shadow-[0_0_24px_color-mix(in_oklch,var(--gold)_18%,transparent)]">
            <Swords className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-[30px] leading-none font-semibold tracking-[0.18em] text-gold uppercase mt-4">
            DH Helper
          </h1>
        </div>

        {/* ── Ribbon divider ────────────────────────────────────── */}
        <div className="dh-ribbon">
          <div className="dh-ribbon-line" aria-hidden />
          <div className="dh-ribbon-box">
            <Lock className="w-3 h-3" />
            <span>Invite Only</span>
          </div>
          <div className="dh-ribbon-line right" aria-hidden />
        </div>

        {/* ── Form card (clipped corner, like domain card) ──────── */}
        <div className="dh-domain-card mt-1 p-6 shadow-[0_0_30px_color-mix(in_oklch,var(--purple-glow)_20%,transparent)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="dh-feat-group-label flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" />
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username…"
                className="bg-input border-border-strong text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold focus-visible:ring-gold/20 h-10"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="dh-feat-group-label flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password…"
                className="bg-input border-border-strong text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold focus-visible:ring-gold/20 h-10"
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
              className="w-full bg-gold text-background hover:bg-gold/80 disabled:opacity-50 font-display font-semibold tracking-[0.18em] uppercase text-xs h-10"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              {fetchStatus === "fetching" ? "Signing In…" : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
