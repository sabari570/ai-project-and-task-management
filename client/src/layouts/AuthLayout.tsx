import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="mb-8 text-center">
        <Link to="/" className="text-lg font-semibold text-indigo-700">
          ProjectHub AI
        </Link>
        <p className="mt-1 text-sm text-zinc-500">Intelligent project & task management</p>
      </div>
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  )
}