import { listProjects } from '@/api/projects'
import { getWorkspace } from '@/api/workspaces'
import { getWorkspaceOverview } from '@/api/reports'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

export function WorkspaceDetailPage() {
  const { workspaceId = '' } = useParams()
  const ws = useQuery({ queryKey: ['workspace', workspaceId], queryFn: () => getWorkspace(workspaceId) })
  const overview = useQuery({
    queryKey: ['reports', workspaceId],
    queryFn: () => getWorkspaceOverview(workspaceId),
  })
  const projects = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => listProjects(workspaceId),
  })

  if (ws.isLoading) return <Skeleton className="h-32 w-full" />
  if (!ws.data) return null

  return (
    <div>
      <PageHeader title={ws.data.name} description={ws.data.description ?? undefined} />
      <div className="grid gap-4 md:grid-cols-3">
        {overview.isLoading ? (
          <Skeleton className="h-24" />
        ) : overview.data ? (
          <>
            <Card>
              <p className="text-xs text-zinc-500">Projects</p>
              <p className="text-2xl font-semibold">{overview.data.project_count}</p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">Open tasks</p>
              <p className="text-2xl font-semibold">{overview.data.open_tasks}</p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500">Members</p>
              <p className="text-2xl font-semibold">{overview.data.member_count}</p>
            </Card>
          </>
        ) : null}
      </div>
      <h2 className="mb-3 mt-8 text-sm font-semibold">Projects</h2>
      <h2 className="sr-only">Project list</h2>
      <div className="grid gap-2">
        {(projects.data ?? []).map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <Card className="hover:border-indigo-200">
              <span className="font-medium">{p.name}</span>
              <span className="ml-2 text-xs text-zinc-500">{p.status}</span>
            </Card>
          </Link>
        ))}
      </div>
      <Link className="mt-4 inline-block text-sm text-indigo-600" to={`/workspaces/${workspaceId}/projects`}>
        View all projects →
      </Link>
    </div>
  )
}