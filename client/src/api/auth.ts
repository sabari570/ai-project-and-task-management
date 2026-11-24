import { client, setTokens, clearTokens } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore, newId } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type { AuthTokens, UserResponse } from '@/types'

// API: POST /api/v1/auth/register
export async function register(input: {
  email: string
  password: string
  display_name: string
}): Promise<UserResponse> {
  if (useApiFor('auth')) {
    return client.post<UserResponse>('/api/v1/auth/register', input)
  }
  await mockDelay()
  const s = getMockStore()
  const user: UserResponse = {
    id: newId('u'),
    email: input.email.toLowerCase(),
    display_name: input.display_name,
    is_active: true,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  s.users.push(user)
  s.currentUserId = user.id
  s.accessToken = 'mock-access-token'
  setTokens(s.accessToken, 'mock-refresh-token')
  return user
}

// API: POST /api/v1/auth/login
export async function login(input: {
  email: string
  password: string
}): Promise<AuthTokens & { user: UserResponse }> {
  if (useApiFor('auth')) {
    const tokens = await client.post<AuthTokens>('/api/v1/auth/login', input)
    setTokens(tokens.access_token, tokens.refresh_token)
    const user = await client.get<UserResponse>('/api/v1/users/me')
    return { ...tokens, user }
  }
  await mockDelay()
  const s = getMockStore()
  const user =
    s.users.find((u) => u.email === input.email.toLowerCase()) ?? s.users[0]!
  s.currentUserId = user.id
  const tokens: AuthTokens = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'bearer',
  }
  setTokens(tokens.access_token, tokens.refresh_token)
  return { ...tokens, user }
}

// API: POST /api/v1/auth/logout
export async function logout(): Promise<void> {
  if (useApiFor('auth')) {
    await client.post('/api/v1/auth/logout')
  } else {
    await mockDelay(120)
  }
  clearTokens()
}

// API: POST /api/v1/auth/forgot-password
export async function forgotPassword(_email: string): Promise<{ message: string }> {
  if (useApiFor('auth')) {
    return client.post('/api/v1/auth/forgot-password', { email: _email })
  }
  await mockDelay()
  return { message: 'If an account exists, reset instructions were sent.' }
}

// API: POST /api/v1/auth/reset-password
export async function resetPassword(_token: string, _password: string): Promise<{ message: string }> {
  if (useApiFor('auth')) {
    return client.post('/api/v1/auth/reset-password', { token: _token, password: _password })
  }
  await mockDelay()
  return { message: 'Password updated.' }
}

// API: POST /api/v1/auth/verify-email
export async function verifyEmail(_token: string): Promise<{ message: string }> {
  if (useApiFor('auth')) {
    return client.post('/api/v1/auth/verify-email', { token: _token })
  }
  await mockDelay()
  const s = getMockStore()
  const u = s.users.find((x) => x.id === s.currentUserId)
  if (u) u.is_verified = true
  return { message: 'Email verified.' }
}