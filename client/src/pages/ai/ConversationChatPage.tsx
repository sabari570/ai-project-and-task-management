import { getConversation, listMessages, sendMessage, streamMockReply } from '@/api/ai'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

export function ConversationChatPage() {
  const { conversationId = '' } = useParams()
  const qc = useQueryClient()
  const [input, setInput] = useState('')
  const [streamPreview, setStreamPreview] = useState('')

  const conv = useQuery({
    queryKey: ['ai-conv', conversationId],
    queryFn: () => getConversation(conversationId),
  })
  const messages = useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: () => listMessages(conversationId),
  })

  const send = useMutation({
    mutationFn: async () => {
      await sendMessage(conversationId, input)
      setStreamPreview('')
      for await (const chunk of streamMockReply('Streaming mock response for your message.')) {
        setStreamPreview((s) => s + chunk)
      }
    },
    onSuccess: () => {
      setInput('')
      void qc.invalidateQueries({ queryKey: ['ai-messages', conversationId] })
    },
  })

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={conv.data?.title ?? 'Chat'} />
      <Card className="mb-4 max-h-96 space-y-3 overflow-y-auto">
        {(messages.data ?? []).map((m) => (
          <div
            key={m.id}
            className={
              m.role === 'user'
                ? 'ml-8 rounded-lg bg-indigo-50 p-2 text-sm'
                : 'mr-8 rounded-lg bg-zinc-100 p-2 text-sm'
            }
          >
            {m.content}
          </div>
        ))}
        {streamPreview ? (
          <div className="mr-8 rounded-lg border border-dashed border-indigo-200 p-2 text-sm text-indigo-800">
            {streamPreview}
          </div>
        ) : null}
      </Card>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your projects…" />
        <Button onClick={() => send.mutate()} disabled={!input || send.isPending}>
          Send
        </Button>
      </div>
    </div>
  )
}