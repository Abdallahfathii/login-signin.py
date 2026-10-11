import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'solid' | 'soft'
}

export function Button({
  loading = false,
  variant = 'solid',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    variant === 'solid'
      ? 'bg-[#BF81FD] text-white hover:bg-[#a866f0] focus-visible:outline-[#BF81FD] dark:bg-[#BF81FD] dark:text-slate-950 dark:hover:bg-[#c995fd]'
      : 'bg-[#EBD6FF] text-[#5b21b6] hover:bg-[#e0c4ff] focus-visible:outline-[#EBD6FF] dark:bg-[#EBD6FF] dark:text-slate-900 dark:hover:bg-[#f3e7ff]'
  return (
    <button
      className={`${base} ${styles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {loading ? 'Please wait…' : children}
    </button>
  )
}
