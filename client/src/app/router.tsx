import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { ConversationChatPage } from '@/pages/ai/ConversationChatPage'
import { ConversationsPage } from '@/pages/ai/ConversationsPage'
import { TaskPlanPage } from '@/pages/ai/TaskPlanPage'
import { DocumentDetailPage } from '@/pages/documents/DocumentDetailPage'
import { DocumentsPage } from '@/pages/documents/DocumentsPage'
import { HomeRedirect } from '@/pages/HomeRedirect'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { ProjectReportsPage } from '@/pages/projects/ProjectReportsPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { SessionsPage } from '@/pages/settings/SessionsPage'
import { TaskDetailPage } from '@/pages/tasks/TaskDetailPage'
import { ActivityPage } from '@/pages/workspaces/ActivityPage'
import { InvitationsPage } from '@/pages/workspaces/InvitationsPage'
import { MembersPage } from '@/pages/workspaces/MembersPage'
import { WorkspaceDetailPage } from '@/pages/workspaces/WorkspaceDetailPage'
import { WorkspaceReportsPage } from '@/pages/workspaces/WorkspaceReportsPage'
import { WorkspacesPage } from '@/pages/workspaces/WorkspacesPage'
import { acceptInvitation } from '@/api/workspaces'
import { Button } from '@/components/ui/Button'
import { createBrowserRouter, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

function AcceptInvitationPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? 'mock-invite'
  return (
    <div className="p-6 text-center">
      <h1 className="text-lg font-semibold">Accept invitation</h1>
      <Button
        className="mt-4"
        onClick={async () => {
          const res = await acceptInvitation(token)
          toast.success(res.message)
        }}
      >
        Accept (mock)
      </Button>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <HomeRedirect /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
    ],
  },
  { path: '/invitations/accept', element: <AcceptInvitationPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/workspaces', element: <WorkspacesPage /> },
      { path: '/workspaces/:workspaceId', element: <WorkspaceDetailPage /> },
      { path: '/workspaces/:workspaceId/members', element: <MembersPage /> },
      { path: '/workspaces/:workspaceId/invitations', element: <InvitationsPage /> },
      { path: '/workspaces/:workspaceId/projects', element: <ProjectsPage /> },
      { path: '/workspaces/:workspaceId/activity', element: <ActivityPage /> },
      { path: '/workspaces/:workspaceId/reports', element: <WorkspaceReportsPage /> },
      { path: '/projects/:projectId', element: <ProjectDetailPage /> },
      { path: '/projects/:projectId/reports', element: <ProjectReportsPage /> },
      { path: '/tasks/:taskId', element: <TaskDetailPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/ai/conversations', element: <ConversationsPage /> },
      { path: '/ai/conversations/:conversationId', element: <ConversationChatPage /> },
      { path: '/ai/task-plans', element: <TaskPlanPage /> },
      { path: '/documents', element: <DocumentsPage /> },
      { path: '/documents/:documentId', element: <DocumentDetailPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/sessions', element: <SessionsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])