import { getApiBaseUrl } from '@/lib/env'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

const ACCESS_KEY = 'projecthub_access_token'
const REFRESH_KEY = 'projecthub_refresh_token'

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_KEY)
}

export function setTokens(access: string, refresh: string): void {
  sessionStorage.setItem(ACCESS_KEY, access)
  sessionStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl()
  if (path.startsWith('http')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

async function parseError(res: Response): Promise<ApiError> {
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = await res.text()
  }
  const message =
    typeof body === 'object' && body !== null && 'detail' in body
      ? String((body as { detail: unknown }).detail)
      : res.statusText
  return new ApiError(message, res.status, body)
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res = await fetch(buildUrl(path), { ...options, headers })

  if (res.status === 401) {
    // API: POST /api/v1/auth/refresh — wire when T032 is integrated
    const refresh = sessionStorage.getItem(REFRESH_KEY)
    if (refresh) {
      const refreshRes = await fetch(buildUrl('/api/v1/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      })
      if (refreshRes.ok) {
        const tokens = (await refreshRes.json()) as {
          access_token: string
          refresh_token: string
        }
        setTokens(tokens.access_token, tokens.refresh_token)
        headers.set('Authorization', `Bearer ${tokens.access_token}`)
        res = await fetch(buildUrl(path), { ...options, headers })
      }
    }
  }

  if (res.status === 204) return undefined as T
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as T
}

export const client = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}