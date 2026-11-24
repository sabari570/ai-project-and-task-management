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

import {
  AI_CONV_1,
  DOC_1,
  DOC_2,
  PRJ_LAUNCH,
  PRJ_MOBILE,
  PRJ_PROTOTYPE,
  PRJ_REBRAND,
  USER_ALICE,
  USER_BOB,
  USER_CARA,
  WS_ACME,
  WS_DESIGN,
} from './ids'

const t = (iso: string) => iso

export const seedUsers: UserResponse[] = [
  {
    id: USER_ALICE,
    email: 'alice@acme.dev',
    display_name: 'Alice Chen',
    is_active: true,
    is_verified: true,
    created_at: t('2025-01-10T08:00:00Z'),
    updated_at: t('2025-01-10T08:00:00Z'),
  },
  {
    id: USER_BOB,
    email: 'bob@acme.dev',
    display_name: 'Bob Rivera',
    is_active: true,
    is_verified: true,
    created_at: t('2025-01-11T08:00:00Z'),
    updated_at: t('2025-01-11T08:00:00Z'),
  },
  {
    id: USER_CARA,
    email: 'cara@designstudio.io',
    display_name: 'Cara Okonkwo',
    is_active: true,
    is_verified: false,
    created_at: t('2025-02-01T08:00:00Z'),
    updated_at: t('2025-02-01T08:00:00Z'),
  },
]

export const seedWorkspaces: WorkspaceResponse[] = [
  {
    id: WS_ACME,
    name: 'Acme Product',
    slug: 'acme-product',
    description: 'Core product delivery workspace.',
    created_at: t('2025-01-10T09:00:00Z'),
    updated_at: t('2025-03-01T09:00:00Z'),
  },
  {
    id: WS_DESIGN,
    name: 'Design Studio',
    slug: 'design-studio',
    description: 'Brand and UX research.',
    created_at: t('2025-02-01T09:00:00Z'),
    updated_at: t('2025-02-15T09:00:00Z'),
  },
]

export const seedMembers: WorkspaceMember[] = [
  {
    id: 'm-1',
    workspace_id: WS_ACME,
    user_id: USER_ALICE,
    role: 'owner',
    joined_at: t('2025-01-10T09:00:00Z'),
  },
  {
    id: 'm-2',
    workspace_id: WS_ACME,
    user_id: USER_BOB,
    role: 'admin',
    joined_at: t('2025-01-12T09:00:00Z'),
  },
  {
    id: 'm-3',
    workspace_id: WS_ACME,
    user_id: USER_CARA,
    role: 'member',
    joined_at: t('2025-02-05T09:00:00Z'),
  },
  {
    id: 'm-4',
    workspace_id: WS_DESIGN,
    user_id: USER_CARA,
    role: 'owner',
    joined_at: t('2025-02-01T09:00:00Z'),
  },
  {
    id: 'm-5',
    workspace_id: WS_DESIGN,
    user_id: USER_ALICE,
    role: 'viewer',
    joined_at: t('2025-02-10T09:00:00Z'),
  },
]

export const seedInvitations: WorkspaceInvitation[] = [
  {
    id: 'inv-1',
    workspace_id: WS_ACME,
    invited_email: 'newhire@acme.dev',
    role: 'member',
    status: 'pending',
    created_at: t('2025-03-10T10:00:00Z'),
    expires_at: t('2025-03-17T10:00:00Z'),
  },
]

export const seedProjects: ProjectResponse[] = [
  {
    id: PRJ_LAUNCH,
    workspace_id: WS_ACME,
    name: 'Q2 Launch',
    description: 'Ship v1 to production.',
    status: 'active',
    start_date: '2025-02-01',
    due_date: '2025-06-30',
    created_at: t('2025-02-01T10:00:00Z'),
    updated_at: t('2025-03-01T10:00:00Z'),
  },
  {
    id: PRJ_MOBILE,
    workspace_id: WS_ACME,
    name: 'Mobile App',
    description: 'React Native client.',
    status: 'planned',
    start_date: null,
    due_date: '2025-09-01',
    created_at: t('2025-02-15T10:00:00Z'),
    updated_at: t('2025-02-15T10:00:00Z'),
  },
  {
    id: PRJ_REBRAND,
    workspace_id: WS_DESIGN,
    name: 'Rebrand 2025',
    description: 'Visual identity refresh.',
    status: 'active',
    start_date: '2025-02-01',
    due_date: '2025-05-01',
    created_at: t('2025-02-02T10:00:00Z'),
    updated_at: t('2025-02-20T10:00:00Z'),
  },
  {
    id: PRJ_PROTOTYPE,
    workspace_id: WS_DESIGN,
    name: 'Prototype Lab',
    description: 'Figma → code experiments.',
    status: 'on_hold',
    start_date: null,
    due_date: null,
    created_at: t('2025-02-10T10:00:00Z'),
    updated_at: t('2025-02-10T10:00:00Z'),
  },
]

function task(
  id: string,
  projectId: string,
  title: string,
  status: TaskResponse['status'],
  priority: TaskResponse['priority'],
  assignee: string | null,
  position: number,
): TaskResponse {
  return {
    id,
    project_id: projectId,
    parent_task_id: null,
    title,
    description: null,
    status,
    priority,
    creator_id: USER_ALICE,
    assignee_id: assignee,
    due_at: status === 'done' ? null : '2025-04-15T17:00:00Z',
    position,
    version: 1,
    created_at: t('2025-03-01T12:00:00Z'),
    updated_at: t('2025-03-05T12:00:00Z'),
  }
}

export const seedTasks: TaskResponse[] = [
  task('t-001', PRJ_LAUNCH, 'API auth endpoints', 'done', 'high', USER_BOB, 0),
  task('t-002', PRJ_LAUNCH, 'Workspace CRUD', 'in_progress', 'high', USER_ALICE, 1),
  task('t-003', PRJ_LAUNCH, 'Task board UI', 'in_progress', 'normal', USER_CARA, 2),
  task('t-004', PRJ_LAUNCH, 'E2E test plan', 'todo', 'normal', null, 3),
  task('t-005', PRJ_LAUNCH, 'Deploy staging', 'backlog', 'low', null, 4),
  task('t-006', PRJ_LAUNCH, 'Fix login redirect', 'blocked', 'urgent', USER_BOB, 5),
  task('t-007', PRJ_LAUNCH, 'Notification emails', 'backlog', 'normal', null, 6),
  task('t-008', PRJ_LAUNCH, 'Activity feed', 'todo', 'low', USER_ALICE, 7),
  task('t-009', PRJ_MOBILE, 'Choose RN version', 'todo', 'normal', USER_BOB, 0),
  task('t-010', PRJ_MOBILE, 'Design system tokens', 'backlog', 'low', null, 1),
  task('t-011', PRJ_REBRAND, 'Logo concepts', 'in_progress', 'high', USER_CARA, 0),
  task('t-012', PRJ_REBRAND, 'Color palette', 'done', 'normal', USER_CARA, 1),
  task('t-013', PRJ_REBRAND, 'Typography scale', 'todo', 'normal', USER_ALICE, 2),
  task('t-014', PRJ_PROTOTYPE, 'Spike parallax hero', 'cancelled', 'low', null, 0),
  task('t-015', PRJ_LAUNCH, 'Document upload flow', 'in_progress', 'normal', USER_CARA, 8),
  {
    ...task('t-016', PRJ_LAUNCH, 'Subtask: OpenAPI review', 'todo', 'normal', USER_BOB, 9),
    parent_task_id: 't-002',
    description: 'Review generated schema against MASTER_PLAN.',
  },
]

export const seedComments: CommentResponse[] = [
  {
    id: 'c-1',
    task_id: 't-002',
    author_id: USER_BOB,
    body: 'Slug validation matches backend regex.',
    created_at: t('2025-03-02T14:00:00Z'),
    updated_at: t('2025-03-02T14:00:00Z'),
    deleted_at: null,
  },
  {
    id: 'c-2',
    task_id: 't-003',
    author_id: USER_CARA,
    body: 'Kanban columns use task status enum.',
    created_at: t('2025-03-03T14:00:00Z'),
    updated_at: t('2025-03-03T14:00:00Z'),
    deleted_at: null,
  },
]

export const seedLabels: LabelResponse[] = [
  {
    id: 'l-1',
    workspace_id: WS_ACME,
    name: 'backend',
    color: '#4f46e5',
    created_at: t('2025-01-15T10:00:00Z'),
  },
  {
    id: 'l-2',
    workspace_id: WS_ACME,
    name: 'frontend',
    color: '#0ea5e9',
    created_at: t('2025-01-15T10:00:00Z'),
  },
  {
    id: 'l-3',
    workspace_id: WS_DESIGN,
    name: 'brand',
    color: '#d946ef',
    created_at: t('2025-02-02T10:00:00Z'),
  },
]

export const seedTaskLabels: { task_id: string; label_id: string }[] = [
  { task_id: 't-002', label_id: 'l-1' },
  { task_id: 't-003', label_id: 'l-2' },
]

export const seedDependencies: TaskDependency[] = [
  {
    id: 'dep-1',
    task_id: 't-004',
    depends_on_task_id: 't-002',
  },
]

export const seedAttachments: AttachmentResponse[] = [
  {
    id: 'att-1',
    task_id: 't-015',
    filename: 'requirements.pdf',
    content_type: 'application/pdf',
    size_bytes: 245_000,
    uploaded_by: USER_CARA,
    created_at: t('2025-03-04T10:00:00Z'),
  },
]

export const seedActivity: ActivityLogResponse[] = [
  {
    id: 'act-1',
    workspace_id: WS_ACME,
    actor_id: USER_ALICE,
    entity_type: 'task',
    entity_id: 't-002',
    action: 'task.updated',
    activity_metadata: { status: 'in_progress' },
    created_at: t('2025-03-05T11:00:00Z'),
  },
  {
    id: 'act-2',
    workspace_id: WS_ACME,
    actor_id: USER_BOB,
    entity_type: 'project',
    entity_id: PRJ_LAUNCH,
    action: 'project.created',
    activity_metadata: null,
    created_at: t('2025-02-01T10:30:00Z'),
  },
  {
    id: 'act-3',
    workspace_id: WS_DESIGN,
    actor_id: USER_CARA,
    entity_type: 'task',
    entity_id: 't-011',
    action: 'task.assigned',
    activity_metadata: { assignee_id: USER_CARA },
    created_at: t('2025-03-06T09:00:00Z'),
  },
]

export const seedNotifications: NotificationResponse[] = [
  {
    id: 'n-1',
    recipient_id: USER_ALICE,
    workspace_id: WS_ACME,
    type: 'task.assigned',
    title: 'Task assigned to you',
    body: 'Task board UI',
    payload: { task_id: 't-003' },
    read_at: null,
    created_at: t('2025-03-04T08:00:00Z'),
  },
  {
    id: 'n-2',
    recipient_id: USER_ALICE,
    workspace_id: WS_ACME,
    type: 'comment.created',
    title: 'New comment',
    body: 'On Workspace CRUD',
    payload: { task_id: 't-002' },
    read_at: t('2025-03-04T09:00:00Z'),
    created_at: t('2025-03-03T16:00:00Z'),
  },
  {
    id: 'n-3',
    recipient_id: USER_ALICE,
    workspace_id: null,
    type: 'system',
    title: 'Welcome to ProjectHub AI',
    body: 'You are viewing mock data.',
    payload: null,
    read_at: null,
    created_at: t('2025-01-10T08:05:00Z'),
  },
]

export const seedSessions: SessionResponse[] = [
  {
    id: 'sess-1',
    user_agent: 'Chrome / macOS',
    ip_address: '127.0.0.1',
    created_at: t('2025-03-10T08:00:00Z'),
    last_used_at: t('2025-03-10T12:00:00Z'),
    current: true,
  },
  {
    id: 'sess-2',
    user_agent: 'Safari / iPhone',
    ip_address: '192.168.1.42',
    created_at: t('2025-03-01T08:00:00Z'),
    last_used_at: t('2025-03-08T18:00:00Z'),
    current: false,
  },
]

export const seedConversations: AIConversation[] = [
  {
    id: AI_CONV_1,
    user_id: USER_ALICE,
    workspace_id: WS_ACME,
    title: 'Q2 launch risks',
    created_at: t('2025-03-09T10:00:00Z'),
    updated_at: t('2025-03-09T10:30:00Z'),
  },
]

export const seedMessages: AIMessage[] = [
  {
    id: 'msg-1',
    conversation_id: AI_CONV_1,
    role: 'user',
    content: 'What tasks are blocking the launch?',
    created_at: t('2025-03-09T10:00:00Z'),
  },
  {
    id: 'msg-2',
    conversation_id: AI_CONV_1,
    role: 'assistant',
    content:
      'Based on your project data, "Fix login redirect" is blocked and marked urgent. "E2E test plan" depends on Workspace CRUD completing first.',
    created_at: t('2025-03-09T10:01:00Z'),
  },
]

export const seedDocuments: DocumentResponse[] = [
  {
    id: DOC_1,
    workspace_id: WS_ACME,
    title: 'Product requirements.pdf',
    status: 'ready',
    uploaded_by: USER_ALICE,
    created_at: t('2025-03-01T10:00:00Z'),
    updated_at: t('2025-03-02T10:00:00Z'),
  },
  {
    id: DOC_2,
    workspace_id: WS_ACME,
    title: 'Security review draft.docx',
    status: 'processing',
    uploaded_by: USER_BOB,
    created_at: t('2025-03-08T10:00:00Z'),
    updated_at: t('2025-03-08T10:05:00Z'),
  },
]