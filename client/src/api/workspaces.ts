import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore, newId } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type {
  Paginated,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceResponse,
  WorkspaceRole,
} from '@/types'

function userWorkspaces(): WorkspaceResponse[] {
  const s = getMockStore()
  const wsIds = new Set(
    s.members.filter((m) => m.user_id === s.currentUserId).map((m) => m.workspace_id),
  )
  return s.workspaces.filter((w) => wsIds.has(w.id))
}

// API: GET /api/v1/workspaces
export async function listWorkspaces(): Promise<WorkspaceResponse[]> {
  if (useApiFor('workspaces')) {
    return client.get<WorkspaceResponse[]>('/api/v1/workspaces')
  }
  await mockDelay()
  return userWorkspaces()
}

// API: POST /api/v1/workspaces
export async function createWorkspace(input: {
  name: string
  slug: string
  description?: string | null
}): Promise<WorkspaceResponse> {
  if (useApiFor('workspaces')) {
    return client.post<WorkspaceResponse>('/api/v1/workspaces', input)
  }
  await mockDelay()
  const s = getMockStore()
  const ws: WorkspaceResponse = {
    id: newId('ws'),
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  s.workspaces.push(ws)
  s.members.push({
    id: newId('m'),
    workspace_id: ws.id,
    user_id: s.currentUserId,
    role: 'owner',
    joined_at: new Date().toISOString(),
  })
  return ws
}

// API: GET /api/v1/workspaces/{workspace_id}
export async function getWorkspace(workspaceId: string): Promise<WorkspaceResponse> {
  if (useApiFor('workspaces')) {
    return client.get<WorkspaceResponse>(`/api/v1/workspaces/${workspaceId}`)
  }
  await mockDelay()
  const ws = getMockStore().workspaces.find((w) => w.id === workspaceId)
  if (!ws) throw new Error('Workspace not found')
  return { ...ws }
}

// API: PATCH /api/v1/workspaces/{workspace_id}
export async function updateWorkspace(
  workspaceId: string,
  patch: Partial<Pick<WorkspaceResponse, 'name' | 'slug' | 'description'>>,
): Promise<WorkspaceResponse> {
  if (useApiFor('workspaces')) {
    return client.patch<WorkspaceResponse>(`/api/v1/workspaces/${workspaceId}`, patch)
  }
  await mockDelay()
  const s = getMockStore()
  const ws = s.workspaces.find((w) => w.id === workspaceId)!
  Object.assign(ws, patch, { updated_at: new Date().toISOString() })
  return { ...ws }
}

// API: DELETE /api/v1/workspaces/{workspace_id}
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  if (useApiFor('workspaces')) {
    await client.delete(`/api/v1/workspaces/${workspaceId}`)
    return
  }
  await mockDelay()
  const s = getMockStore()
  s.workspaces = s.workspaces.filter((w) => w.id !== workspaceId)
}

// API: GET /api/v1/workspaces/{workspace_id}/members
export async function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (useApiFor('workspaces')) {
    return client.get<WorkspaceMember[]>(`/api/v1/workspaces/${workspaceId}/members`)
  }
  await mockDelay()
  const s = getMockStore()
  return s.members
    .filter((m) => m.workspace_id === workspaceId)
    .map((m) => ({
      ...m,
      user: s.users.find((u) => u.id === m.user_id),
    }))
}

// API: PATCH /api/v1/workspaces/{workspace_id}/members/{user_id}
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
): Promise<WorkspaceMember> {
  if (useApiFor('workspaces')) {
    return client.patch<WorkspaceMember>(
      `/api/v1/workspaces/${workspaceId}/members/${userId}`,
      { role },
    )
  }
  await mockDelay()
  const m = getMockStore().members.find(
    (x) => x.workspace_id === workspaceId && x.user_id === userId,
  )!
  m.role = role
  return { ...m }
}

// API: DELETE /api/v1/workspaces/{workspace_id}/members/{user_id}
export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  if (useApiFor('workspaces')) {
    await client.delete(`/api/v1/workspaces/${workspaceId}/members/${userId}`)
    return
  }
  await mockDelay()
  const s = getMockStore()
  s.members = s.members.filter(
    (m) => !(m.workspace_id === workspaceId && m.user_id === userId),
  )
}

// API: POST /api/v1/workspaces/{workspace_id}/invitations
export async function createInvitation(
  workspaceId: string,
  input: { invited_email: string; role: WorkspaceRole },
): Promise<WorkspaceInvitation> {
  if (useApiFor('workspaces')) {
    return client.post<WorkspaceInvitation>(
      `/api/v1/workspaces/${workspaceId}/invitations`,
      input,
    )
  }
  await mockDelay()
  const inv: WorkspaceInvitation = {
    id: newId('inv'),
    workspace_id: workspaceId,
    invited_email: input.invited_email,
    role: input.role,
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 864e5).toISOString(),
  }
  getMockStore().invitations.push(inv)
  return inv
}

export async function listInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
  await mockDelay(100)
  return getMockStore().invitations.filter((i) => i.workspace_id === workspaceId)
}

// API: POST /api/v1/invitations/accept
export async function acceptInvitation(_token: string): Promise<{ message: string }> {
  if (useApiFor('workspaces')) {
    return client.post('/api/v1/invitations/accept', { token: _token })
  }
  await mockDelay()
  return { message: 'Invitation accepted (mock).' }
}

// API: GET /api/v1/workspaces/{workspace_id}/activity
export async function listActivity(
  workspaceId: string,
  limit = 50,
  offset = 0,
): Promise<Paginated<import('@/types').ActivityLogResponse>> {
  if (useApiFor('workspaces')) {
    return client.get(`/api/v1/workspaces/${workspaceId}/activity?limit=${limit}&offset=${offset}`)
  }
  await mockDelay()
  const items = getMockStore()
    .activity.filter((a) => a.workspace_id === workspaceId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
  const slice = items.slice(offset, offset + limit)
  return { items: slice, total: items.length, limit, offset }
}