import { getProject } from '@/api/projects'
import { getProjectTaskReport } from '@/api/reports'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { taskStatusLabel } from '@/lib/taskStyles'
import type { TaskStatus } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

export function ProjectReportsPage() {
  const { projectId = '' } = useParams()
  const project = useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId) })
  const report = useQuery({
    queryKey: ['project-report', projectId],
    queryFn: () => getProjectTaskReport(projectId),
  })

  return (
    <div>
      <PageHeader title={`Reports — ${project.data?.name ?? 'Project'}`} />
      <Card>
        {(Object.entries(report.data ?? {}) as [TaskStatus, number][]).map(([status, count]) => (
          <div key={status} className="flex justify-between border-b border-zinc-50 py-2 text-sm last:border-0">
            <span>{taskStatusLabel[status]}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}