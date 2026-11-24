import { listSessions, revokeSession } from '@/api/users'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/format'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function SessionsPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['sessions'], queryFn: listSessions })

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Active sessions" />
      <div className="space-y-2">
        {(data ?? []).map((s) => (
          <Card key={s.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">
                {s.user_agent} {s.current ? '(current)' : ''}
              </p>
              <p className="text-xs text-zinc-500">Last used {formatDate(s.last_used_at)}</p>
            </div>
            {!s.current ? (
              <Button
                variant="ghost"
                onClick={() => {
                  void revokeSession(s.id).then(() => qc.invalidateQueries({ queryKey: ['sessions'] }))
                }}
              >
                Revoke
              </Button>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}