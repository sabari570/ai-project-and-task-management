import {
  seedActivity,
  seedAttachments,
  seedComments,
  seedConversations,
  seedDependencies,
  seedDocuments,
  seedInvitations,
  seedLabels,
  seedMembers,
  seedMessages,
  seedNotifications,
  seedProjects,
  seedSessions,
  seedTaskLabels,
  seedTasks,
  seedUsers,
  seedWorkspaces,
} from '@/mocks/fixtures/seed'
import type {
  ActivityLogResponse,
  AIConversation,
  AIMessage,
  AttachmentResponse,
  CommentResponse,
  DocumentResponse,
  LabelResponse,
  NotificationResponse,
  ProjectResponse,
  SessionResponse,
  TaskDependency,
  TaskResponse,
  UserResponse,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceResponse,
} from '@/types'

function clone<T>(data: T): T {
  return structuredClone(data)
}

export interface MockStore {
  users: UserResponse[]
  workspaces: WorkspaceResponse[]
  members: WorkspaceMember[]
  invitations: WorkspaceInvitation[]
  projects: ProjectResponse[]
  tasks: TaskResponse[]
  comments: CommentResponse[]
  labels: LabelResponse[]
  taskLabels: { task_id: string; label_id: string }[]
  dependencies: TaskDependency[]
  attachments: AttachmentResponse[]
  activity: ActivityLogResponse[]
  notifications: NotificationResponse[]
  sessions: SessionResponse[]
  conversations: AIConversation[]
  messages: AIMessage[]
  documents: DocumentResponse[]
  currentUserId: string
  accessToken: string
}

export function createMockStore(): MockStore {
  return {
    users: clone(seedUsers),
    workspaces: clone(seedWorkspaces),
    members: clone(seedMembers),
    invitations: clone(seedInvitations),
    projects: clone(seedProjects),
    tasks: clone(seedTasks),
    comments: clone(seedComments),
    labels: clone(seedLabels),
    taskLabels: clone(seedTaskLabels),
    dependencies: clone(seedDependencies),
    attachments: clone(seedAttachments),
    activity: clone(seedActivity),
    notifications: clone(seedNotifications),
    sessions: clone(seedSessions),
    conversations: clone(seedConversations),
    messages: clone(seedMessages),
    documents: clone(seedDocuments),
    currentUserId: seedUsers[0]!.id,
    accessToken: 'mock-access-token',
  }
}

let store = createMockStore()

export function getMockStore(): MockStore {
  return store
}

export function resetMockStore(): void {
  store = createMockStore()
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}