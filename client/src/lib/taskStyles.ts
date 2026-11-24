import type { TaskPriority, TaskStatus } from '@/types'

export const taskStatusLabel: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
}

export const taskStatusClass: Record<TaskStatus, string> = {
  backlog: 'bg-zinc-100 text-zinc-700',
  todo: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  blocked: 'bg-amber-50 text-amber-800',
  done: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

export const taskPriorityClass: Record<TaskPriority, string> = {
  low: 'bg-zinc-50 text-zinc-600',
  normal: 'bg-slate-50 text-slate-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-rose-50 text-rose-700',
}

export const KANBAN_COLUMNS: TaskStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'blocked',
  'done',
]