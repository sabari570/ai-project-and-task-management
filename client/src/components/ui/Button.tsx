import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50',
  ghost: 'text-zinc-600 hover:bg-zinc-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
} as const

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}