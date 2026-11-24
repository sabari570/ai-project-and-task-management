import { useAuth } from '@/app/auth-context'
import { register as apiRegister } from '@/api/auth'
import { setTokens } from '@/api/client'
import { getMockStore } from '@/mocks/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  display_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export function RegisterPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (v) => {
        await apiRegister(v)
        const s = getMockStore()
        setTokens(s.accessToken, 'mock-refresh-token')
        await refreshUser()
        toast.success('Account created (mock)')
        navigate('/workspaces')
      })}
    >
      <h2 className="text-lg font-semibold">Create account</h2>
      <Input placeholder="Display name" {...form.register('display_name')} />
      <Input type="email" placeholder="Email" {...form.register('email')} />
      <Input type="password" placeholder="Password" {...form.register('password')} />
      <Button type="submit" className="w-full">
        Register
      </Button>
      <p className="text-center text-xs">
        <Link to="/login" className="text-indigo-600">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}