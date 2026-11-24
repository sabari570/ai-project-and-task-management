import { useAuth } from '@/app/auth-context'
import { Navigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'

export function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Skeleton className="m-8 h-8 w-32" />
  return <Navigate to={isAuthenticated ? '/workspaces' : '/login'} replace />
}