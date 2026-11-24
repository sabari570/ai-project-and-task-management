import { listNotifications, markAllNotificationsRead, markNotification } from '@/api/notifications'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatRelative } from '@/lib/format'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function NotificationsPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: listNotifications })

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div>
      <PageHeader
        title="Notifications"
        action={
          <Button variant="secondary" onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        }
      />
      <div className="space-y-2">
        {(data ?? []).map((n) => (
          <Card
            key={n.id}
            className={n.read_at ? 'opacity-70' : 'border-indigo-100 bg-indigo-50/30'}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{n.title}</p>
                {n.body ? <p className="text-sm text-zinc-600">{n.body}</p> : null}
              </div>
              <span className="text-xs text-zinc-400">{formatRelative(n.created_at)}</span>
            </div>
            {!n.read_at ? (
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  void markNotification(n.id, true).then(() =>
                    qc.invalidateQueries({ queryKey: ['notifications'] }),
                  )
                }}
              >
                Mark read
              </Button>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}