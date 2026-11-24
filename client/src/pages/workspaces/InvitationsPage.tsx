import { createInvitation, listInvitations } from '@/api/workspaces'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import type { WorkspaceRole } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function InvitationsPage() {
  const { workspaceId = '' } = useParams()
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WorkspaceRole>('member')

  const { data } = useQuery({
    queryKey: ['invitations', workspaceId],
    queryFn: () => listInvitations(workspaceId),
  })

  const invite = useMutation({
    mutationFn: () => createInvitation(workspaceId, { invited_email: email, role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['invitations', workspaceId] })
      setEmail('')
      toast.success('Invitation sent (mock)')
    },
  })

  return (
    <div>
      <PageHeader title="Invitations" description="Invite teammates by email." />
      <Card className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="email@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-xs" />
        <select className="rounded-lg border border-zinc-200 px-2" value={role} onChange={(e) => setRole(e.target.value as WorkspaceRole)}>
          <option value="member">member</option>
          <option value="admin">admin</option>
          <option value="viewer">viewer</option>
        </select>
        <Button onClick={() => invite.mutate()} disabled={!email}>
          Invite
        </Button>
      </Card>
      <div className="space-y-2">
        {(data ?? []).map((inv) => (
          <Card key={inv.id} className="flex justify-between text-sm">
            <span>{inv.invited_email}</span>
            <span className="text-zinc-500">
              {inv.role} · {inv.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}