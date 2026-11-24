import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type { TaskStatus, WorkspaceReportOverview } from '@/types'

// API: GET /api/v1/workspaces/{workspace_id}/reports/overview
export async function getWorkspaceOverview(
  workspaceId: string,
): Promise<WorkspaceReportOverview> {
  if (useApiFor('reports')) {
    return client.get<WorkspaceReportOverview>(
      `/api/v1/workspaces/${workspaceId}/reports/overview`,
    )
  }
  await mockDelay()
  const s = getMockStore()
  const projects = s.projects.filter((p) => p.workspace_id === workspaceId)
  const projectIds = new Set(projects.map((p) => p.id))
  const tasks = s.tasks.filter((t) => projectIds.has(t.project_id))
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled').length
  const done = tasks.filter((t) => t.status === 'done').length
  const members = s.members.filter((m) => m.workspace_id === workspaceId).length
  return {
    workspace_id: workspaceId,
    project_count: projects.length,
    member_count: members,
    open_tasks: open,
    completed_tasks: done,
  }
}

// API: GET /api/v1/projects/{project_id}/reports/tasks
export async function getProjectTaskReport(projectId: string): Promise<Record<TaskStatus, number>> {
  if (useApiFor('reports')) {
    return client.get<Record<TaskStatus, number>>(
      `/api/v1/projects/${projectId}/reports/tasks`,
    )
  }
  await mockDelay()
  const tasks = getMockStore().tasks.filter((t) => t.project_id === projectId)
  const out: Record<TaskStatus, number> = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
    cancelled: 0,
  }
  for (const t of tasks) out[t.status]++
  return out
}

// API: GET /api/v1/workspaces/{workspace_id}/reports/export
export async function exportWorkspaceReport(workspaceId: string): Promise<Blob> {
  if (useApiFor('reports')) {
    const res = await fetch(`/api/v1/workspaces/${workspaceId}/reports/export`)
    return res.blob()
  }
  await mockDelay()
  const overview = await getWorkspaceOverview(workspaceId)
  const json = JSON.stringify({ workspace_id: workspaceId, overview, exported_at: new Date() }, null, 2)
  return new Blob([json], { type: 'application/json' })
}