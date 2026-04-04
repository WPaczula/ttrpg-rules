"use client"

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { UnauthorizedError } from "@/lib/srd/api-client"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk()
  const signOutRef = useRef(signOut)
  signOutRef.current = signOut

  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof UnauthorizedError) signOutRef.current()
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: 1000 * 60 * 60,
            retry: (failureCount, error) => error instanceof UnauthorizedError ? false : failureCount < 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
