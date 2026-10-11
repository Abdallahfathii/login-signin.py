import type { ReactNode } from 'react'

interface AuthSliderProps {
  active: 'login' | 'register'
  onSwitch: (panel: 'login' | 'register') => void
  login: ReactNode
  register: ReactNode
}

export function AuthSlider({ active, onSwitch, login, register }: AuthSliderProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-xl shadow-brand/20 dark:shadow-black/40">
      <div
        className="flex w-[200%] transition-transform duration-[450ms] ease-in-out"
        style={{ transform: active === 'register' ? 'translateX(-50%)' : 'translateX(0)' }}
      >
        <div className="w-1/2 shrink-0 bg-[#EBD6FF] p-8 text-slate-900 dark:bg-brand-dark-panel dark:text-brand-soft sm:p-10">
          {login}
        </div>
        <div className="w-1/2 shrink-0 bg-[#BF81FD] p-8 text-white dark:bg-brand-dark-panel-alt dark:text-brand-soft sm:p-10">
          {register}
        </div>
      </div>
      <nav className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2" aria-label="Auth panels">
        <button
          type="button"
          onClick={() => onSwitch('login')}
          aria-current={active === 'login'}
          className={`h-2 rounded-full transition-all duration-300 ${
            active === 'login' ? 'w-6 bg-[#BF81FD] dark:bg-brand-soft' : 'w-2 bg-slate-400/60 dark:bg-slate-500/60'
          }`}
          aria-label="Go to login"
        />
        <button
          type="button"
          onClick={() => onSwitch('register')}
          aria-current={active === 'register'}
          className={`h-2 rounded-full transition-all duration-300 ${
            active === 'register'
              ? 'w-6 bg-[#EBD6FF] dark:bg-brand-soft'
              : 'w-2 bg-slate-300/60 dark:bg-slate-500/60'
          }`}
          aria-label="Go to sign in"
        />
      </nav>
    </div>
  )
}
