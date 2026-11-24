import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/workspaces" className="mt-4 inline-block text-indigo-600">
        Go to workspaces
      </Link>
    </div>
  )
}