import {
  addAttachment,
  addComment,
  attachLabel,
  detachLabel,
  getTask,
  listAttachments,
  listComments,
  listDependencies,
  listTaskLabels,
  updateTask,
} from '@/api/tasks'
import { getMockStore } from '@/mocks/store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { taskPriorityClass, taskStatusClass, taskStatusLabel } from '@/lib/taskStyles'
import type { TaskPriority, TaskStatus } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function TaskDetailPage() {
  const { taskId = '' } = useParams()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')

  const task = useQuery({ queryKey: ['task', taskId], queryFn: () => getTask(taskId) })
  const comments = useQuery({ queryKey: ['comments', taskId], queryFn: () => listComments(taskId) })
  const labels = useQuery({ queryKey: ['task-labels', taskId], queryFn: () => listTaskLabels(taskId) })
  const deps = useQuery({ queryKey: ['deps', taskId], queryFn: () => listDependencies(taskId) })
  const attachments = useQuery({ queryKey: ['attachments', taskId], queryFn: () => listAttachments(taskId) })

  const patch = useMutation({
    mutationFn: (body: Partial<{ status: TaskStatus; priority: TaskPriority; title: string }>) =>
      updateTask(taskId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['task', taskId] })
      toast.success('Saved')
    },
  })

  const postComment = useMutation({
    mutationFn: () => addComment(taskId, comment),
    onSuccess: () => {
      setComment('')
      void qc.invalidateQueries({ queryKey: ['comments', taskId] })
    },
  })

  if (!task.data) return null

  const wsLabels = getMockStore().labels

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={task.data.title}
        action={
          <Link to={`/projects/${task.data.project_id}`} className="text-sm text-indigo-600">
            ← Back to project
          </Link>
        }
      />
      <Card className="mb-4 space-y-3">
        <div className="flex gap-2">
          <Badge className={taskStatusClass[task.data.status]}>{taskStatusLabel[task.data.status]}</Badge>
          <Badge className={taskPriorityClass[task.data.priority]}>{task.data.priority}</Badge>
        </div>
        <textarea
          className="w-full rounded-lg border border-zinc-200 p-2 text-sm"
          rows={3}
          defaultValue={task.data.description ?? ''}
          placeholder="Description"
          readOnly
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-zinc-500">
            Status
            <select
              className="mt-1 w-full rounded border border-zinc-200"
              value={task.data.status}
              onChange={(e) => patch.mutate({ status: e.target.value as TaskStatus })}
            >
              {Object.keys(taskStatusLabel).map((s) => (
                <option key={s} value={s}>
                  {taskStatusLabel[s as TaskStatus]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-zinc-500">
            Priority
            <select
              className="mt-1 w-full rounded border border-zinc-200"
              value={task.data.priority}
              onChange={(e) => patch.mutate({ priority: e.target.value as TaskPriority })}
            >
              {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold">Comments</h2>
        <div className="mb-2 space-y-2">
          {(comments.data ?? []).map((c) => {
            const author = getMockStore().users.find((u) => u.id === c.author_id)
            return (
              <Card key={c.id} className="text-sm">
                <p className="font-medium">{author?.display_name}</p>
                <p className="text-zinc-600">{c.body}</p>
              </Card>
            )
          })}
        </div>
        <div className="flex gap-2">
          <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment" />
          <Button onClick={() => postComment.mutate()} disabled={!comment}>
            Post
          </Button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold">Labels</h2>
        <div className="flex flex-wrap gap-2">
          {(labels.data ?? []).map((l) => (
            <button
              key={l.id}
              type="button"
              className="rounded-full px-2 py-1 text-xs text-white"
              style={{ background: l.color }}
              onClick={() => {
                void detachLabel(taskId, l.id).then(() =>
                  qc.invalidateQueries({ queryKey: ['task-labels', taskId] }),
                )
              }}
            >
              {l.name} ×
            </button>
          ))}
        </div>
        <select
          className="mt-2 rounded border border-zinc-200 text-sm"
          defaultValue=""
          onChange={async (e) => {
            if (!e.target.value) return
            await attachLabel(taskId, e.target.value)
            void qc.invalidateQueries({ queryKey: ['task-labels', taskId] })
            e.target.value = ''
          }}
        >
          <option value="">Attach label…</option>
          {wsLabels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold">Dependencies</h2>
        <ul className="text-sm text-zinc-600">
          {(deps.data ?? []).map((d) => (
            <li key={d.id}>
              Depends on{' '}
              <Link className="text-indigo-600" to={`/tasks/${d.depends_on_task_id}`}>
                {d.depends_on_task_id.slice(0, 8)}…
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Attachments</h2>
        <ul className="mb-2 space-y-1 text-sm">
          {(attachments.data ?? []).map((a) => (
            <li key={a.id}>
              {a.filename} ({Math.round(a.size_bytes / 1024)} KB)
            </li>
          ))}
        </ul>
        <Input
          type="file"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            await addAttachment(taskId, { name: file.name, type: file.type, size: file.size })
            void qc.invalidateQueries({ queryKey: ['attachments', taskId] })
            toast.success('Attachment added (mock)')
          }}
        />
      </section>
    </div>
  )
}