import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { ThemeToggle } from '../components/ThemeToggle'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') ?? ''
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validLink = Boolean(uid && token)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!password) {
      setError('New password is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/password-reset/confirm', { uid, token, password })
      setDone(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { detail?: string } } }).response
        setError(response?.data?.detail ?? 'Something went wrong. Please try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-full items-center justify-center p-4">
      <ThemeToggle />
      <div className="w-full max-w-md rounded-2xl bg-[#BF81FD] p-8 text-white shadow-xl shadow-brand/20 dark:bg-brand-dark-panel-alt dark:text-brand-soft sm:p-10">
        {!validLink ? (
          <>
            <h2 className="mb-2 text-2xl font-bold">Invalid link</h2>
            <p className="mb-6 text-sm opacity-75">
              This reset link is missing required parts. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block rounded-lg bg-[#EBD6FF] px-4 py-2.5 text-sm font-semibold text-[#5b21b6] transition-colors hover:bg-[#f3e7ff] dark:text-slate-900"
            >
              Request new link
            </Link>
          </>
        ) : done ? (
          <>
            <h2 className="mb-2 text-2xl font-bold">Password updated</h2>
            <p className="mb-6 text-sm opacity-75">
              Your password has been changed. You can now log in with your new password.
            </p>
            <Button type="button" variant="soft" onClick={() => navigate('/')}>
              Go to log in
            </Button>
          </>
        ) : (
          <>
            <h2 className="mb-1 text-2xl font-bold">Set new password</h2>
            <p className="mb-6 text-sm opacity-75">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat the password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && (
                <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}
              <Button type="submit" variant="soft" loading={loading}>
                Update password
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
