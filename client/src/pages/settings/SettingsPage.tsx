import { useAuth } from '@/app/auth-context'
import { changePassword, updateProfile } from '@/api/users'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'

export function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.display_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [pw, setPw] = useState({ current: '', next: '' })

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Settings"
        action={
          <Link to="/settings/sessions" className="text-sm text-indigo-600">
            Sessions →
          </Link>
        }
      />
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Profile</h2>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          onClick={async () => {
            await updateProfile({ display_name: name, email })
            await refreshUser()
            toast.success('Profile updated')
          }}
        >
          Save profile
        </Button>
      </Card>
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Password</h2>
        <Input
          type="password"
          placeholder="Current"
          value={pw.current}
          onChange={(e) => setPw({ ...pw, current: e.target.value })}
        />
        <Input
          type="password"
          placeholder="New (min 8)"
          value={pw.next}
          onChange={(e) => setPw({ ...pw, next: e.target.value })}
        />
        <Button
          variant="secondary"
          onClick={async () => {
            await changePassword(pw.current, pw.next)
            toast.success('Password changed (mock)')
          }}
        >
          Change password
        </Button>
      </Card>
    </div>
  )
}