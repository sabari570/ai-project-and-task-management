import { createWorkspace, listWorkspaces } from '@/api/workspaces'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function WorkspacesPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['workspaces'], queryFn: listWorkspaces })
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const create = useMutation({
    mutationFn: () =>
      createWorkspace({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['workspaces'] })
      setName('')
      setSlug('')
      toast.success('Workspace created')
    },
  })

  if (isLoading) return <Skeleton className="h-40 w-full" />

  return (
    <div>
      <PageHeader title="Workspaces" description="Spaces where your team manages projects." />
      <Card className="mb-6">
        <h3 className="text-sm font-medium">New workspace</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
          <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="max-w-xs" />
          <Button onClick={() => create.mutate()} disabled={!name || create.isPending}>
            Create
          </Button>
        </div>
      </Card>
      {!data?.length ? (
        <EmptyState title="No workspaces" description="Create one to get started." actionLabel="Create above" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((w) => (
            <Link key={w.id} to={`/workspaces/${w.id}`}>
              <Card className="transition hover:border-indigo-200 hover:shadow">
                <h3 className="font-medium">{w.name}</h3>
                <p className="text-xs text-zinc-500">{w.slug}</p>
                {w.description ? <p className="mt-2 text-sm text-zinc-600">{w.description}</p> : null}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}