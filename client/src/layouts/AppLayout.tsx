import { useAuth } from '@/app/auth-context'
import { unreadCount } from '@/api/notifications'
import { listWorkspaces } from '@/api/workspaces'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-lg px-3 py-2 text-sm transition',
    isActive ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100',
  )

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { workspaceId } = useParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces,
  })

  const activeWs = workspaceId ?? workspaces[0]?.id
  const unread = useMemo(() => unreadCount(), [user])

  const wsBase = activeWs ? `/workspaces/${activeWs}` : '/workspaces'

  const sidebar = (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Workspace</p>
        <select
          className="mt-2 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          value={activeWs ?? ''}
          onChange={(e) => navigate(`/workspaces/${e.target.value}`)}
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavLink to="/workspaces" className={navLinkClass} end>
          All workspaces
        </NavLink>
        {activeWs ? (
          <>
            <NavLink to={wsBase} className={navLinkClass} end>
              Overview
            </NavLink>
            <NavLink to={`${wsBase}/projects`} className={navLinkClass}>
              Projects
            </NavLink>
            <NavLink to={`${wsBase}/members`} className={navLinkClass}>
              Members
            </NavLink>
            <NavLink to={`${wsBase}/invitations`} className={navLinkClass}>
              Invitations
            </NavLink>
            <NavLink to={`${wsBase}/activity`} className={navLinkClass}>
              Activity
            </NavLink>
            <NavLink to={`${wsBase}/reports`} className={navLinkClass}>
              Reports
            </NavLink>
          </>
        ) : null}
        <div className="my-2 border-t border-zinc-100 pt-2">
          <NavLink to="/notifications" className={navLinkClass}>
            Notifications
            {unread > 0 ? (
              <span className="ml-2 rounded-full bg-indigo-600 px-1.5 text-xs text-white">
                {unread}
              </span>
            ) : null}
          </NavLink>
          <NavLink to="/ai/conversations" className={navLinkClass}>
            AI assistant
          </NavLink>
          <NavLink to="/ai/task-plans" className={navLinkClass}>
            AI task plans
          </NavLink>
          <NavLink to="/documents" className={navLinkClass}>
            Documents
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            Settings
          </NavLink>
        </div>
      </nav>
      <div className="border-t border-zinc-100 p-3 text-xs text-zinc-500">
        {user?.display_name}
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-dvh">
      <div className="hidden md:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-2 py-1 text-sm md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </button>
            <Link to="/" className="font-semibold text-indigo-700">
              ProjectHub AI
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/notifications')}>
              Alerts{unread ? ` (${unread})` : ''}
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
            >
              Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}