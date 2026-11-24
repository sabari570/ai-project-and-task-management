import { listMembers, removeMember, updateMemberRole } from '@/api/workspaces'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import type { WorkspaceRole } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function MembersPage() {
  const { workspaceId = '' } = useParams()
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => listMembers(workspaceId),
  })

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: WorkspaceRole }) =>
      updateMemberRole(workspaceId, userId, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['members', workspaceId] })
      toast.success('Role updated')
    },
  })

  const remove = useMutation({
    mutationFn: (userId: string) => removeMember(workspaceId, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['members', workspaceId] })
      toast.success('Member removed')
    },
  })

  return (
    <div>
      <PageHeader title="Members" description="Manage workspace roles." />
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-zinc-500">
              <th className="py-2">User</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((m) => (
              <tr key={m.id} className="border-b border-zinc-50">
                <td className="py-2">
                  {m.user?.display_name ?? m.user_id}
                  <div className="text-xs text-zinc-400">{m.user?.email}</div>
                </td>
                <td>
                  <select
                    value={m.role}
                    className="rounded border border-zinc-200 text-sm"
                    onChange={(e) =>
                      updateRole.mutate({ userId: m.user_id, role: e.target.value as WorkspaceRole })
                    }
                  >
                    {(['owner', 'admin', 'member', 'viewer'] as const).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {m.role !== 'owner' ? (
                    <Button variant="ghost" onClick={() => remove.mutate(m.user_id)}>
                      Remove
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}