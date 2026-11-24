import { createConversation, listConversations } from '@/api/ai'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function ConversationsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const { data } = useQuery({ queryKey: ['ai-conversations'], queryFn: listConversations })

  const create = useMutation({
    mutationFn: () => createConversation(title || 'New chat'),
    onSuccess: (c) => {
      void qc.invalidateQueries({ queryKey: ['ai-conversations'] })
      navigate(`/ai/conversations/${c.id}`)
    },
  })

  return (
    <div>
      <PageHeader title="AI assistant" description="Project-scoped chat (mock until T074)." />
      <Card className="mb-4 flex gap-2">
        <Input placeholder="Conversation title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button onClick={() => create.mutate()}>New chat</Button>
      </Card>
      <div className="space-y-2">
        {(data ?? []).map((c) => (
          <Link key={c.id} to={`/ai/conversations/${c.id}`}>
            <Card className="hover:border-indigo-200">
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-zinc-400">Updated {new Date(c.updated_at).toLocaleString()}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}