import { useState } from 'react'
import { AuthSlider } from '../components/AuthSlider'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'
import { ThemeToggle } from '../components/ThemeToggle'

export function AuthPage() {
  const [active, setActive] = useState<'login' | 'register'>('login')

  return (
    <main className="relative flex min-h-full items-center justify-center p-4">
      <ThemeToggle />
      <div className="w-full max-w-3xl">
        <AuthSlider
          active={active}
          onSwitch={setActive}
          login={<LoginForm onSwitchToRegister={() => setActive('register')} />}
          register={<RegisterForm onSwitchToLogin={() => setActive('login')} />}
        />
      </div>
    </main>
  )
}
