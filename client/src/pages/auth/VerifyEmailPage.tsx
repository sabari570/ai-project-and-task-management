import { verifyEmail } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? 'mock-verify'

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold">Verify email</h2>
      <Button
        onClick={async () => {
          const res = await verifyEmail(token)
          toast.success(res.message)
        }}
      >
        Confirm verification (mock)
      </Button>
    </div>
  )
}