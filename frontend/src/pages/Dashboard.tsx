import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

export function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          You&apos;re logged in. This page is only visible to authenticated users.
        </p>
        {user && (
          <dl className="mb-6 space-y-2 rounded-lg bg-[#EBD6FF] p-4 text-sm text-slate-900 dark:bg-brand-dark-panel dark:text-brand-soft">
            <div className="flex justify-between gap-4">
              <dt className="font-medium">Name</dt>
              <dd>{user.name || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium">Username</dt>
              <dd>{user.username}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium">Email</dt>
              <dd className="truncate">{user.email}</dd>
            </div>
          </dl>
        )}
        <Button type="button" onClick={() => void logout()}>
          Log out
        </Button>
      </div>
    </main>
  )
}
