export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'cancelled'

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export type ProjectStatus =
  | 'planned'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'archived'

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export type DocumentStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'failed'

export interface Paginated<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface UserResponse {
  id: string
  email: string
  display_name: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface WorkspaceResponse {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  joined_at: string
  user?: UserResponse
}

export interface WorkspaceInvitation {
  id: string
  workspace_id: string
  invited_email: string
  role: WorkspaceRole
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at: string
  expires_at: string
}

export interface ProjectResponse {
  id: string
  workspace_id: string
  name: string
  description: string | null
  status: ProjectStatus
  start_date: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskResponse {
  id: string
  project_id: string
  parent_task_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  creator_id: string
  assignee_id: string | null
  due_at: string | null
  position: number
  version: number
  created_at: string
  updated_at: string
}

export interface CommentResponse {
  id: string
  task_id: string
  author_id: string
  body: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface LabelResponse {
  id: string
  workspace_id: string
  name: string
  color: string
  created_at: string
}

export interface TaskDependency {
  id: string
  task_id: string
  depends_on_task_id: string
}

export interface AttachmentResponse {
  id: string
  task_id: string
  filename: string
  content_type: string
  size_bytes: number
  uploaded_by: string
  created_at: string
}

export interface ActivityLogResponse {
  id: string
  workspace_id: string
  actor_id: string | null
  entity_type: string
  entity_id: string
  action: string
  activity_metadata: Record<string, unknown> | null
  created_at: string
}

export interface NotificationResponse {
  id: string
  recipient_id: string
  workspace_id: string | null
  type: string
  title: string
  body: string | null
  payload: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

export interface SessionResponse {
  id: string
  user_agent: string
  ip_address: string
  created_at: string
  last_used_at: string
  current: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AIConversation {
  id: string
  user_id: string
  workspace_id: string | null
  title: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface AITaskPlanSuggestion {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
}

export interface DocumentResponse {
  id: string
  workspace_id: string
  title: string
  status: DocumentStatus
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface ProjectSummary {
  project_id: string
  total_tasks: number
  by_status: Record<TaskStatus, number>
  overdue_count: number
}

export interface WorkspaceReportOverview {
  workspace_id: string
  project_count: number
  member_count: number
  open_tasks: number
  completed_tasks: number
}