import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { ThemeToggle } from '../components/ThemeToggle'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resetUrl, setResetUrl] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setLoading(true)
    try {
      const res = await api.post<{ detail: string; reset_url?: string }>('/auth/password-reset', {
        email: email.trim(),
      })
      setSent(true)
      if (res.data.reset_url) setResetUrl(res.data.reset_url)
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
      <div className="w-full max-w-md rounded-2xl bg-[#EBD6FF] p-8 text-slate-900 shadow-xl shadow-brand/20 dark:bg-brand-dark-panel dark:text-brand-soft sm:p-10">
        {sent ? (
          <>
            <h2 className="mb-2 text-2xl font-bold">Check your email</h2>
            <p className="mb-6 text-sm opacity-75">
              If an account exists for <span className="font-semibold">{email}</span>, we sent a
              link to reset your password. It&apos;s valid for 1 hour.
            </p>
            {resetUrl && (
              <a
                href={resetUrl}
                className="mb-6 block break-all rounded-lg bg-white/60 p-3 text-xs font-medium underline dark:bg-slate-900/50"
              >
                {resetUrl}
              </a>
            )}
            <Link
              to="/"
              className="inline-block rounded-lg bg-[#BF81FD] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a866f0] dark:text-slate-950"
            >
              Back to log in
            </Link>
          </>
        ) : (
          <>
            <h2 className="mb-1 text-2xl font-bold">Forgot password?</h2>
            <p className="mb-6 text-sm opacity-75">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error && !email.trim() ? error : undefined}
              />
              {error && (
                <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}
              <Button type="submit" loading={loading}>
                Send reset link
              </Button>
            </form>
            <p className="mt-6 text-sm">
              Remember your password?{' '}
              <Link
                to="/"
                className="font-semibold text-[#7c3aed] underline-offset-2 hover:underline dark:text-brand-soft"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
