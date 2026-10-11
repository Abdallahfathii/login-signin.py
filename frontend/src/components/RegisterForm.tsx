import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from './Button'
import { Input } from './Input'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

interface FieldErrors {
  username?: string
  email?: string
  name?: string
  password?: string
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const errs: FieldErrors = {}
    if (!username.trim()) errs.username = 'Username is required'
    if (!email.trim()) errs.email = 'Email is required'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'At least 8 characters'
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        name: name.trim(),
        password,
      })
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const data = (err as { response?: { data?: Record<string, unknown> } }).response?.data
        if (data && typeof data === 'object') {
          const messages: string[] = []
          const next: FieldErrors = {}
          for (const [key, value] of Object.entries(data)) {
            const text = Array.isArray(value) ? value.join(' ') : String(value)
            if (key in { username: 1, email: 1, name: 1, password: 1 }) {
              ;(next as Record<string, string>)[key] = text
            } else {
              messages.push(text)
            }
          }
          setFieldErrors(next)
          setError(messages.join(' ') || 'Please fix the highlighted fields.')
        } else {
          setError('Registration failed. Please try again.')
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[480px] flex-col justify-center">
      <h2 className="mb-1 text-2xl font-bold">Create account</h2>
      <p className="mb-6 text-sm opacity-75">Sign in to get started</p>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Username"
          autoComplete="username"
          placeholder="janedoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fieldErrors.username}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <Input
          label="Full name (optional)"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        {error && (
          <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" variant="soft" loading={loading}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-[#EBD6FF] underline-offset-2 hover:underline dark:text-brand-soft"
        >
          Log in
        </button>
      </p>
    </div>
  )
}
