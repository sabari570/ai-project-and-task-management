import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type { SessionResponse, UserResponse } from '@/types'

// API: GET /api/v1/users/me
export async function getCurrentUser(): Promise<UserResponse> {
  if (useApiFor('auth')) {
    return client.get<UserResponse>('/api/v1/users/me')
  }
  await mockDelay(100)
  const s = getMockStore()
  return s.users.find((u) => u.id === s.currentUserId) ?? s.users[0]!
}

// API: PATCH /api/v1/users/me
export async function updateProfile(patch: {
  display_name?: string
  email?: string
}): Promise<UserResponse> {
  if (useApiFor('auth')) {
    return client.patch<UserResponse>('/api/v1/users/me', patch)
  }
  await mockDelay()
  const s = getMockStore()
  const u = s.users.find((x) => x.id === s.currentUserId)!
  if (patch.display_name) u.display_name = patch.display_name
  if (patch.email) u.email = patch.email
  u.updated_at = new Date().toISOString()
  return { ...u }
}

// API: PATCH /api/v1/users/me/password
export async function changePassword(_current: string, _next: string): Promise<void> {
  if (useApiFor('auth')) {
    await client.patch('/api/v1/users/me/password', {
      current_password: _current,
      new_password: _next,
    })
    return
  }
  await mockDelay()
}

// API: GET /api/v1/users/me/sessions
export async function listSessions(): Promise<SessionResponse[]> {
  if (useApiFor('auth')) {
    return client.get<SessionResponse[]>('/api/v1/users/me/sessions')
  }
  await mockDelay()
  return [...getMockStore().sessions]
}

// API: DELETE /api/v1/users/me/sessions/{session_id}
export async function revokeSession(sessionId: string): Promise<void> {
  if (useApiFor('auth')) {
    await client.delete(`/api/v1/users/me/sessions/${sessionId}`)
    return
  }
  await mockDelay()
  const s = getMockStore()
  s.sessions = s.sessions.filter((x) => x.id !== sessionId)
}