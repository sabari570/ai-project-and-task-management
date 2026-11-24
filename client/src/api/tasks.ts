import { client } from '@/api/client'
import { mockDelay } from '@/mocks/delays'
import { getMockStore, newId } from '@/mocks/store'
import { useApiFor } from '@/lib/env'
import type {
  AttachmentResponse,
  CommentResponse,
  LabelResponse,
  Paginated,
  TaskPriority,
  TaskResponse,
  TaskStatus,
} from '@/types'

export interface TaskListParams {
  status?: TaskStatus
  assignee_id?: string
  priority?: TaskPriority
  search?: string
  limit?: number
  offset?: number
}

// API: GET /api/v1/projects/{project_id}/tasks
export async function listTasks(
  projectId: string,
  params: TaskListParams = {},
): Promise<Paginated<TaskResponse>> {
  if (useApiFor('tasks')) {
    const q = new URLSearchParams()
    if (params.status) q.set('status', params.status)
    if (params.assignee_id) q.set('assignee_id', params.assignee_id)
    if (params.priority) q.set('priority', params.priority)
    if (params.search) q.set('search', params.search)
    q.set('limit', String(params.limit ?? 50))
    q.set('offset', String(params.offset ?? 0))
    return client.get(`/api/v1/projects/${projectId}/tasks?${q}`)
  }
  await mockDelay()
  let items = getMockStore().tasks.filter((t) => t.project_id === projectId)
  if (params.status) items = items.filter((t) => t.status === params.status)
  if (params.assignee_id) items = items.filter((t) => t.assignee_id === params.assignee_id)
  if (params.priority) items = items.filter((t) => t.priority === params.priority)
  if (params.search) {
    const s = params.search.toLowerCase()
    items = items.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.description?.toLowerCase().includes(s) ?? false),
    )
  }
  items = [...items].sort((a, b) => a.position - b.position)
  const limit = params.limit ?? 50
  const offset = params.offset ?? 0
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  }
}

// API: POST /api/v1/projects/{project_id}/tasks
export async function createTask(
  projectId: string,
  input: {
    title: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    assignee_id?: string | null
  },
): Promise<TaskResponse> {
  if (useApiFor('tasks')) {
    return client.post<TaskResponse>(`/api/v1/projects/${projectId}/tasks`, {
      project_id: projectId,
      ...input,
    })
  }
  await mockDelay()
  const s = getMockStore()
  const task: TaskResponse = {
    id: newId('t'),
    project_id: projectId,
    parent_task_id: null,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? 'backlog',
    priority: input.priority ?? 'normal',
    creator_id: s.currentUserId,
    assignee_id: input.assignee_id ?? null,
    due_at: null,
    position: s.tasks.filter((t) => t.project_id === projectId).length,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  s.tasks.push(task)
  return task
}

// API: GET /api/v1/tasks/{task_id}
export async function getTask(taskId: string): Promise<TaskResponse> {
  if (useApiFor('tasks')) {
    return client.get<TaskResponse>(`/api/v1/tasks/${taskId}`)
  }
  await mockDelay()
  const t = getMockStore().tasks.find((x) => x.id === taskId)
  if (!t) throw new Error('Task not found')
  return { ...t }
}

// API: PATCH /api/v1/tasks/{task_id}
export async function updateTask(
  taskId: string,
  patch: Partial<TaskResponse>,
): Promise<TaskResponse> {
  if (useApiFor('tasks')) {
    return client.patch<TaskResponse>(`/api/v1/tasks/${taskId}`, patch)
  }
  await mockDelay()
  const s = getMockStore()
  const t = s.tasks.find((x) => x.id === taskId)!
  Object.assign(t, patch, { updated_at: new Date().toISOString(), version: t.version + 1 })
  return { ...t }
}

// API: DELETE /api/v1/tasks/{task_id}
export async function deleteTask(taskId: string): Promise<void> {
  if (useApiFor('tasks')) {
    await client.delete(`/api/v1/tasks/${taskId}`)
    return
  }
  await mockDelay()
  const s = getMockStore()
  s.tasks = s.tasks.filter((t) => t.id !== taskId)
}

// API: POST /api/v1/tasks/{task_id}/comments
export async function addComment(taskId: string, body: string): Promise<CommentResponse> {
  if (useApiFor('tasks')) {
    return client.post<CommentResponse>(`/api/v1/tasks/${taskId}/comments`, { body })
  }
  await mockDelay()
  const s = getMockStore()
  const c: CommentResponse = {
    id: newId('c'),
    task_id: taskId,
    author_id: s.currentUserId,
    body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  }
  s.comments.push(c)
  return c
}

// API: GET /api/v1/tasks/{task_id}/comments
export async function listComments(taskId: string): Promise<CommentResponse[]> {
  if (useApiFor('tasks')) {
    return client.get<CommentResponse[]>(`/api/v1/tasks/${taskId}/comments`)
  }
  await mockDelay(120)
  return getMockStore().comments.filter((c) => c.task_id === taskId && !c.deleted_at)
}

export async function listTaskLabels(taskId: string): Promise<LabelResponse[]> {
  await mockDelay(80)
  const s = getMockStore()
  const ids = s.taskLabels.filter((tl) => tl.task_id === taskId).map((tl) => tl.label_id)
  return s.labels.filter((l) => ids.includes(l.id))
}

// API: PUT /api/v1/tasks/{task_id}/labels/{label_id}
export async function attachLabel(taskId: string, labelId: string): Promise<void> {
  if (useApiFor('tasks')) {
    await client.put(`/api/v1/tasks/${taskId}/labels/${labelId}`)
    return
  }
  await mockDelay(80)
  const s = getMockStore()
  if (!s.taskLabels.some((tl) => tl.task_id === taskId && tl.label_id === labelId)) {
    s.taskLabels.push({ task_id: taskId, label_id: labelId })
  }
}

// API: DELETE /api/v1/tasks/{task_id}/labels/{label_id}
export async function detachLabel(taskId: string, labelId: string): Promise<void> {
  if (useApiFor('tasks')) {
    await client.delete(`/api/v1/tasks/${taskId}/labels/${labelId}`)
    return
  }
  await mockDelay(80)
  const s = getMockStore()
  s.taskLabels = s.taskLabels.filter(
    (tl) => !(tl.task_id === taskId && tl.label_id === labelId),
  )
}

export async function listDependencies(taskId: string) {
  await mockDelay(80)
  return getMockStore().dependencies.filter((d) => d.task_id === taskId)
}

// API: PUT /api/v1/tasks/{task_id}/dependencies/{depends_on_id}
export async function addDependency(taskId: string, dependsOnId: string): Promise<void> {
  if (useApiFor('tasks')) {
    await client.put(`/api/v1/tasks/${taskId}/dependencies/${dependsOnId}`)
    return
  }
  getMockStore().dependencies.push({
    id: newId('dep'),
    task_id: taskId,
    depends_on_task_id: dependsOnId,
  })
}

// API: POST /api/v1/tasks/{task_id}/attachments
export async function addAttachment(
  taskId: string,
  file: { name: string; type: string; size: number },
): Promise<AttachmentResponse> {
  if (useApiFor('tasks')) {
    const form = new FormData()
    form.append('file', new Blob(), file.name)
    // Real upload wired in T045
    return client.post(`/api/v1/tasks/${taskId}/attachments`, form)
  }
  await mockDelay()
  const s = getMockStore()
  const att: AttachmentResponse = {
    id: newId('att'),
    task_id: taskId,
    filename: file.name,
    content_type: file.type,
    size_bytes: file.size,
    uploaded_by: s.currentUserId,
    created_at: new Date().toISOString(),
  }
  s.attachments.push(att)
  return att
}

// API: GET /api/v1/tasks/{task_id}/attachments (via list on task detail mock)
export async function listAttachments(taskId: string): Promise<AttachmentResponse[]> {
  await mockDelay(80)
  return getMockStore().attachments.filter((a) => a.task_id === taskId)
}