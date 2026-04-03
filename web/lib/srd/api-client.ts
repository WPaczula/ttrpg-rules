const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export async function srdFetch<T>(path: string, token: string | null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { headers })
  if (!res.ok) throw new Error(`SRD fetch failed: ${res.status} ${path}`)
  return res.json() as Promise<T>
}
