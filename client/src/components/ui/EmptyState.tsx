import { Button } from './Button'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center">
      <h3 className="text-sm font-medium text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}