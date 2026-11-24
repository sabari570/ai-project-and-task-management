import { createProject, listProjects } from '@/api/projects'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import type { ProjectStatus } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function ProjectsPage() {
  const { workspaceId = '' } = useParams()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [name, setName] = useState('')

  const { data } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => listProjects(workspaceId),
  })

  const filtered = useMemo(
    () => (data ?? []).filter((p) => filter === 'all' || p.status === filter),
    [data, filter],
  )

  const create = useMutation({
    mutationFn: () => createProject(workspaceId, { name, status: 'planned' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', workspaceId] })
      setName('')
      toast.success('Project created')
    },
  })

  return (
    <div>
      <PageHeader title="Projects" description="Plans and delivery tracks in this workspace." />
      <Card className="mb-4 flex flex-wrap items-center gap-2">
        <Input placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
        <Button onClick={() => create.mutate()} disabled={!name}>
          Add project
        </Button>
        <select
          className="ml-auto rounded-lg border border-zinc-200 px-2 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value as ProjectStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {(['planned', 'active', 'on_hold', 'completed', 'archived'] as const).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Card>
      <div className="space-y-2">
        {filtered.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <Card className="hover:border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs capitalize text-zinc-500">{p.status}</span>
              </div>
              {p.description ? <p className="mt-1 text-sm text-zinc-600">{p.description}</p> : null}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}