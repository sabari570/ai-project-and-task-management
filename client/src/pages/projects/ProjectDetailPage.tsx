import { getProject, getProjectSummary } from '@/api/projects'
import { createTask, listTasks } from '@/api/tasks'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { taskStatusClass, taskStatusLabel } from '@/lib/taskStyles'
import type { TaskStatus } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const qc = useQueryClient()
  const [view, setView] = useState<'list' | 'board'>('board')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [newTitle, setNewTitle] = useState('')

  const project = useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId) })
  const summary = useQuery({ queryKey: ['summary', projectId], queryFn: () => getProjectSummary(projectId) })
  const tasks = useQuery({
    queryKey: ['tasks', projectId, search, statusFilter],
    queryFn: () =>
      listTasks(projectId, {
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  })

  const addTask = useMutation({
    mutationFn: () => createTask(projectId, { title: newTitle }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      setNewTitle('')
      toast.success('Task created')
    },
  })

  if (project.isLoading) return <Skeleton className="h-40 w-full" />
  if (!project.data) return null

  const list = tasks.data?.items ?? []

  return (
    <div>
      <PageHeader
        title={project.data.name}
        description={project.data.description ?? undefined}
        action={
          <Link to={`/projects/${projectId}/reports`} className="text-sm text-indigo-600">
            Project reports →
          </Link>
        }
      />
      {summary.data ? (
        <Card className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-500">Tasks</p>
            <p className="text-lg font-semibold">{summary.data.total_tasks}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Overdue</p>
            <p className="text-lg font-semibold text-rose-600">{summary.data.overdue_count}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">In progress</p>
            <p className="text-lg font-semibold">{summary.data.by_status.in_progress}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Done</p>
            <p className="text-lg font-semibold">{summary.data.by_status.done}</p>
          </div>
        </Card>
      ) : null}
      <Card className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select
          className="rounded-lg border border-zinc-200 px-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
        >
          <option value="">All statuses</option>
          {Object.keys(taskStatusLabel).map((s) => (
            <option key={s} value={s}>
              {taskStatusLabel[s as TaskStatus]}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-1">
          <Button variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
            List
          </Button>
          <Button variant={view === 'board' ? 'primary' : 'secondary'} onClick={() => setView('board')}>
            Kanban
          </Button>
        </div>
      </Card>
      <Card className="mb-4 flex gap-2">
        <Input placeholder="New task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Button onClick={() => addTask.mutate()} disabled={!newTitle}>
          Add task
        </Button>
      </Card>
      {view === 'board' ? (
        <TaskBoard projectId={projectId} tasks={list} />
      ) : (
        <div className="space-y-2">
          {list.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`}>
              <Card className="flex items-center justify-between hover:border-indigo-200">
                <span>{t.title}</span>
                <Badge className={taskStatusClass[t.status]}>{taskStatusLabel[t.status]}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}