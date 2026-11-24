import { listActivity } from '@/api/workspaces'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatRelative } from '@/lib/format'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

export function ActivityPage() {
  const { workspaceId = '' } = useParams()
  const { data } = useQuery({
    queryKey: ['activity', workspaceId],
    queryFn: () => listActivity(workspaceId),
  })

  return (
    <div>
      <PageHeader title="Activity" description="Audit-style feed for this workspace." />
      <div className="space-y-2">
        {(data?.items ?? []).map((a) => (
          <Card key={a.id} className="text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{a.action}</span>
              <span className="text-xs text-zinc-400">{formatRelative(a.created_at)}</span>
            </div>
            <p className="text-zinc-500">
              {a.entity_type} {a.entity_id.slice(0, 8)}…
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}