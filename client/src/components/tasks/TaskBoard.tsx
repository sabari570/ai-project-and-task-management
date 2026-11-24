import { updateTask } from '@/api/tasks'
import { Badge } from '@/components/ui/Badge'
import { KANBAN_COLUMNS, taskPriorityClass, taskStatusLabel } from '@/lib/taskStyles'
import { cn } from '@/lib/cn'
import type { TaskResponse } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function TaskBoard({
  projectId,
  tasks,
}: {
  projectId: string
  tasks: TaskResponse[]
}) {
  const qc = useQueryClient()
  const mutate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskResponse['status'] }) =>
      updateTask(id, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task updated')
    },
  })

  return (
    <div>
      <p className="mb-3 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 px-3 py-2 text-xs text-indigo-800">
        Real-time updates — coming with API (T084). Board uses mock drag via status buttons.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {KANBAN_COLUMNS.map((status) => {
          const col = tasks.filter((t) => t.status === status)
          return (
            <div
              key={status}
              className="w-64 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50/80"
            >
              <ColumnHeader status={status} count={col.length} />
              <div className="space-y-2 p-2">
                {col.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
                  >
                    <Link
                      to={`/tasks/${task.id}`}
                      className="font-medium text-zinc-900 hover:text-indigo-700"
                    >
                      {task.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge className={taskPriorityClass[task.priority]}>{task.priority}</Badge>
                    </div>
                    <select
                      className="mt-2 w-full rounded border border-zinc-200 text-xs"
                      value={task.status}
                      onChange={(e) =>
                        mutate.mutate({
                          id: task.id,
                          status: e.target.value as TaskResponse['status'],
                        })
                      }
                    >
                      {KANBAN_COLUMNS.map((s) => (
                        <option key={s} value={s}>
                          {taskStatusLabel[s]}
                        </option>
                      ))}
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ColumnHeader({ status, count }: { status: TaskResponse['status']; count: number }) {
  return (
    <div className={cn('border-b border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700')}>
      {taskStatusLabel[status]} <span className="text-zinc-400">({count})</span>
    </div>
  )
}