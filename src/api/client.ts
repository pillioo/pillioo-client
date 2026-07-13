// Thin fetch wrapper. Base URL defaults to '' (relative), which relies on
// the Vite dev proxy configured in vite.config.ts. Set VITE_API_BASE_URL to
// point at a different backend (e.g. in production) without touching call sites.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type QueryValue = string | number | undefined

function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export async function apiGet<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`)
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new ApiError(response.status, body || `Request to ${path} failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const responseBody = await response.text().catch(() => '')
    throw new ApiError(response.status, responseBody || `Request to ${path} failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}
