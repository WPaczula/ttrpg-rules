const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export class UnauthorizedError extends Error {
  constructor(path: string) {
    super(`Unauthorized: ${path}`)
    this.name = "UnauthorizedError"
  }
}

export async function apiFetch<T>(path: string, token: string | null, init?: Omit<RequestInit, "headers">): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  if (res.status === 401) throw new UnauthorizedError(path)
  if (!res.ok) throw new Error(`API fetch failed: ${res.status} ${path}`)
  return res.json() as Promise<T>
}
