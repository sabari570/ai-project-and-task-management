import { forgotPassword } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await forgotPassword(email)
        toast.message(res.message)
      }}
    >
      <h2 className="text-lg font-semibold">Reset password</h2>
      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
      <Link to="/login" className="block text-center text-xs text-indigo-600">
        Back to sign in
      </Link>
    </form>
  )
}