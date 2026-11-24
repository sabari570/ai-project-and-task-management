import { createTask } from '@/api/tasks'
import { generateTaskPlan } from '@/api/ai'
import { PRJ_LAUNCH } from '@/mocks/fixtures/ids'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import type { AITaskPlanSuggestion } from '@/types'
import { useState } from 'react'
import { toast } from 'sonner'

export function TaskPlanPage() {
  const [requirement, setRequirement] = useState('')
  const [suggestions, setSuggestions] = useState<AITaskPlanSuggestion[]>([])
  const [selected, setSelected] = useState<Record<number, boolean>>({})

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="AI task plans" description="Draft tasks from a requirement (mock T073)." />
      <Card className="space-y-3">
        <textarea
          className="w-full rounded-lg border border-zinc-200 p-2 text-sm"
          rows={4}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Describe what you need to deliver…"
        />
        <Button
          onClick={async () => {
            const plan = await generateTaskPlan({ requirement, project_id: PRJ_LAUNCH })
            setSuggestions(plan)
            setSelected(Object.fromEntries(plan.map((_, i) => [i, true])))
          }}
          disabled={!requirement}
        >
          Generate plan
        </Button>
      </Card>
      {suggestions.length > 0 ? (
        <div className="mt-4 space-y-2">
          {suggestions.map((s, i) => (
            <Card key={i} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!selected[i]}
                onChange={(e) => setSelected({ ...selected, [i]: e.target.checked })}
              />
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-zinc-600">{s.description}</p>
                <p className="text-xs text-zinc-400">
                  {s.priority} · {s.status}
                </p>
              </div>
            </Card>
          ))}
          <Button
            onClick={async () => {
              for (const [i, s] of suggestions.entries()) {
                if (!selected[i]) continue
                await createTask(PRJ_LAUNCH, {
                  title: s.title,
                  description: s.description,
                  priority: s.priority,
                  status: s.status,
                })
              }
              toast.success('Selected tasks added to Q2 Launch (mock)')
            }}
          >
            Accept selected
          </Button>
        </div>
      ) : null}
    </div>
  )
}