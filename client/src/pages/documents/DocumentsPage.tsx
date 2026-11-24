import { listDocuments, uploadDocument } from '@/api/documents'
import { WS_ACME } from '@/mocks/fixtures/ids'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'

export function DocumentsPage() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const { data } = useQuery({ queryKey: ['documents'], queryFn: () => listDocuments() })

  return (
    <div>
      <PageHeader title="Documents" description="Uploads, processing status, summaries (mock)." />
      <Card className="mb-4">
        <p className="mb-2 text-xs text-zinc-500">Mock upload to workspace Acme</p>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-xs" />
          <Input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              const name = title || file?.name || 'Untitled'
              await uploadDocument({ workspace_id: WS_ACME, title: name })
              void qc.invalidateQueries({ queryKey: ['documents'] })
              toast.success('Document queued (mock)')
            }}
          />
          <Button
            variant="secondary"
            onClick={async () => {
              if (!title) return
              await uploadDocument({ workspace_id: WS_ACME, title })
              void qc.invalidateQueries({ queryKey: ['documents'] })
              setTitle('')
              toast.success('Created')
            }}
          >
            Add without file
          </Button>
        </div>
      </Card>
      <div className="space-y-2">
        {(data ?? []).map((d) => (
          <Link key={d.id} to={`/documents/${d.id}`}>
            <Card className="flex justify-between hover:border-indigo-200">
              <span>{d.title}</span>
              <span className="text-xs capitalize text-zinc-500">{d.status}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}