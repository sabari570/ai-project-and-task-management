import { useAuth } from '@/app/auth-context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'alice@acme.dev', password: 'password123' },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (v) => {
        try {
          await login(v.email, v.password)
          navigate('/workspaces')
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Login failed')
        }
      })}
    >
      <h2 className="text-lg font-semibold">Sign in</h2>
      <div>
        <label className="text-xs text-zinc-500">Email</label>
        <Input type="email" {...form.register('email')} />
      </div>
      <div>
        <label className="text-xs text-zinc-500">Password</label>
        <Input type="password" {...form.register('password')} />
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
      <p className="text-center text-xs text-zinc-500">
        <Link to="/forgot-password" className="text-indigo-600">
          Forgot password?
        </Link>
        {' · '}
        <Link to="/register" className="text-indigo-600">
          Create account
        </Link>
      </p>
    </form>
  )
}