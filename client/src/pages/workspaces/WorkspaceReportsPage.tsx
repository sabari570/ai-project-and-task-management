import { listProjects } from '@/api/projects'
import { exportWorkspaceReport, getProjectTaskReport, getWorkspaceOverview } from '@/api/reports'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { taskStatusLabel } from '@/lib/taskStyles'
import type { TaskStatus } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function WorkspaceReportsPage() {
  const { workspaceId = '' } = useParams()
  const overview = useQuery({
    queryKey: ['reports', workspaceId],
    queryFn: () => getWorkspaceOverview(workspaceId),
  })
  const projects = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => listProjects(workspaceId),
  })

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Workspace metrics and exports."
        action={
          <Button
            variant="secondary"
            onClick={async () => {
              const blob = await exportWorkspaceReport(workspaceId)
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `workspace-${workspaceId}-report.json`
              a.click()
              URL.revokeObjectURL(url)
              toast.success('Export downloaded (mock JSON)')
            }}
          >
            Export JSON
          </Button>
        }
      />
      {overview.data ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {Object.entries({
            Projects: overview.data.project_count,
            Members: overview.data.member_count,
            Open: overview.data.open_tasks,
            Done: overview.data.completed_tasks,
          }).map(([k, v]) => (
            <Card key={k}>
              <p className="text-xs text-zinc-500">{k}</p>
              <p className="text-xl font-semibold">{v}</p>
            </Card>
          ))}
        </div>
      ) : null}
      <h3 className="mb-2 text-sm font-semibold">Task breakdown by project</h3>
      <div className="space-y-4">
        {(projects.data ?? []).map((p) => (
          <ProjectReport key={p.id} projectId={p.id} name={p.name} />
        ))}
      </div>
    </div>
  )
}

function ProjectReport({ projectId, name }: { projectId: string; name: string }) {
  const { data } = useQuery({
    queryKey: ['project-report', projectId],
    queryFn: () => getProjectTaskReport(projectId),
  })
  if (!data) return null
  const max = Math.max(...Object.values(data), 1)
  return (
    <Card>
      <p className="mb-2 font-medium">{name}</p>
      <div className="space-y-1">
        {(Object.entries(data) as [TaskStatus, number][]).map(([status, count]) => (
          <div key={status} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-zinc-500">{taskStatusLabel[status]}</span>
            <div className="h-2 flex-1 overflow-hidden rounded bg-zinc-100">
              <div className="h-full bg-indigo-500" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}