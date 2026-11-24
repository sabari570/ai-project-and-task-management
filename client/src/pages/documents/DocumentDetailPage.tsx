import { getDocument, reindexDocument, summarizeDocument } from '@/api/documents'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/format'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function DocumentDetailPage() {
  const { documentId = '' } = useParams()
  const { data } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId),
  })

  if (!data) return null

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title={data.title} />
      <Card className="space-y-2 text-sm">
        <p>
          Status: <span className="font-medium capitalize">{data.status}</span>
        </p>
        <p className="text-zinc-500">Updated {formatDate(data.updated_at)}</p>
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const res = await summarizeDocument(documentId)
              toast.message(res.message)
            }}
          >
            Summarize
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const res = await reindexDocument(documentId)
              toast.message(res.message)
            }}
          >
            Reindex
          </Button>
        </div>
      </Card>
    </div>
  )
}