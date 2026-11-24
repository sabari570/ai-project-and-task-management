import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore, newId } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type { ProjectResponse, ProjectStatus, ProjectSummary } from '@/types'
import type { TaskStatus } from '@/types'

// API: GET /api/v1/workspaces/{workspace_id}/projects
export async function listProjects(workspaceId: string): Promise<ProjectResponse[]> {
  if (useApiFor('projects')) {
    return client.get<ProjectResponse[]>(`/api/v1/workspaces/${workspaceId}/projects`)
  }
  await mockDelay()
  return getMockStore().projects.filter((p) => p.workspace_id === workspaceId)
}

// API: POST /api/v1/workspaces/{workspace_id}/projects
export async function createProject(
  workspaceId: string,
  input: {
    name: string
    description?: string | null
    status?: ProjectStatus
  },
): Promise<ProjectResponse> {
  if (useApiFor('projects')) {
    return client.post<ProjectResponse>(`/api/v1/workspaces/${workspaceId}/projects`, input)
  }
  await mockDelay()
  const p: ProjectResponse = {
    id: newId('prj'),
    workspace_id: workspaceId,
    name: input.name,
    description: input.description ?? null,
    status: input.status ?? 'planned',
    start_date: null,
    due_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  getMockStore().projects.push(p)
  return p
}

// API: GET /api/v1/projects/{project_id}
export async function getProject(projectId: string): Promise<ProjectResponse> {
  if (useApiFor('projects')) {
    return client.get<ProjectResponse>(`/api/v1/projects/${projectId}`)
  }
  await mockDelay()
  const p = getMockStore().projects.find((x) => x.id === projectId)
  if (!p) throw new Error('Project not found')
  return { ...p }
}

// API: PATCH /api/v1/projects/{project_id}
export async function updateProject(
  projectId: string,
  patch: Partial<ProjectResponse>,
): Promise<ProjectResponse> {
  if (useApiFor('projects')) {
    return client.patch<ProjectResponse>(`/api/v1/projects/${projectId}`, patch)
  }
  await mockDelay()
  const s = getMockStore()
  const p = s.projects.find((x) => x.id === projectId)!
  Object.assign(p, patch, { updated_at: new Date().toISOString() })
  return { ...p }
}

// API: DELETE /api/v1/projects/{project_id}
export async function deleteProject(projectId: string): Promise<void> {
  if (useApiFor('projects')) {
    await client.delete(`/api/v1/projects/${projectId}`)
    return
  }
  await mockDelay()
  const s = getMockStore()
  s.projects = s.projects.filter((p) => p.id !== projectId)
  s.tasks = s.tasks.filter((t) => t.project_id !== projectId)
}

// API: GET /api/v1/projects/{project_id}/summary
export async function getProjectSummary(projectId: string): Promise<ProjectSummary> {
  if (useApiFor('projects')) {
    return client.get<ProjectSummary>(`/api/v1/projects/${projectId}/summary`)
  }
  await mockDelay()
  const tasks = getMockStore().tasks.filter((t) => t.project_id === projectId)
  const by_status = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
    cancelled: 0,
  } satisfies Record<TaskStatus, number>
  for (const t of tasks) by_status[t.status]++
  const overdue = tasks.filter(
    (t) =>
      t.due_at &&
      t.status !== 'done' &&
      t.status !== 'cancelled' &&
      new Date(t.due_at) < new Date(),
  ).length
  return {
    project_id: projectId,
    total_tasks: tasks.length,
    by_status,
    overdue_count: overdue,
  }
}