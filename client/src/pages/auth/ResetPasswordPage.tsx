import { resetPassword } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? 'mock-token'
  const [password, setPassword] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const res = await resetPassword(token, password)
        toast.success(res.message)
      }}
    >
      <h2 className="text-lg font-semibold">Choose new password</h2>
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} />
      <Button type="submit" className="w-full">
        Update password
      </Button>
    </form>
  )
}