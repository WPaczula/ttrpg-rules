"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { io, Socket } from "socket.io-client"
import { apiFetch } from "@/lib/srd/api-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export interface PlayerSummary {
  id: string
  userId: string
  name: string
  hpTotal: number
  hpMarked: number
  stressTotal: number
  stressMarked: number
  armorScore: number
  armorMarked: number
  hope: number
}

interface ServerCharacter {
  id: string
  userId: string
  name: string
  hpTotal: number
  hpMarked: number
  stressTotal: number
  stressMarked: number
  armorMarked: number
  hope: number
  armor: { baseScore: number } | null
}

const TRACKED_STATS = ["hpMarked", "stressMarked", "armorMarked", "hope"] as const
type TrackedStat = (typeof TRACKED_STATS)[number]

interface StatUpdate {
  characterId: string
  characterName: string
  stat: TrackedStat | "level"
  value: number
}

const DEFAULT_ARMOR_SCORE = 2

function toSummary(c: ServerCharacter): PlayerSummary {
  return {
    id: c.id,
    userId: c.userId,
    name: c.name,
    hpTotal: c.hpTotal,
    hpMarked: c.hpMarked,
    stressTotal: c.stressTotal,
    stressMarked: c.stressMarked,
    armorScore: c.armor?.baseScore ?? DEFAULT_ARMOR_SCORE,
    armorMarked: c.armorMarked,
    hope: c.hope,
  }
}

export function usePlayersLive() {
  const { getToken } = useAuth()
  const [players, setPlayers] = useState<PlayerSummary[]>([])
  const socketRef = useRef<Socket | null>(null)

  const { data, isLoading, error } = useQuery<PlayerSummary[]>({
    queryKey: ["gm-players"],
    queryFn: async () => {
      const token = await getToken()
      const res = await apiFetch<ServerCharacter[]>("/characters", token)
      return res.map(toSummary)
    },
    staleTime: 30_000,
    retry: false,
  })

  useEffect(() => {
    if (data) setPlayers(data)
  }, [data])

  const roomIds = useMemo(
    () => Array.from(new Set((data ?? []).map((p) => p.userId))),
    [data],
  )

  useEffect(() => {
    if (roomIds.length === 0) return

    let cancelled = false

    const connect = async () => {
      const token = await getToken()
      if (cancelled) return

      const socket = io(API_BASE, {
        transports: ["websocket"],
        auth: token ? { token } : undefined,
      })
      socketRef.current = socket

      socket.on("connect", () => {
        for (const id of roomIds) socket.emit("joinGame", id)
      })

      socket.on("statUpdate", (update: StatUpdate) => {
        if (!TRACKED_STATS.includes(update.stat as TrackedStat)) return
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === update.characterId
              ? { ...p, [update.stat]: update.value }
              : p,
          ),
        )
      })
    }

    connect()

    return () => {
      cancelled = true
      const socket = socketRef.current
      if (socket) {
        for (const id of roomIds) socket.emit("leaveGame", id)
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [roomIds, getToken])

  return { players, isLoading, error }
}
