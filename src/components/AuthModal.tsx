import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Icon } from './Icon'

interface AuthModalProps {
  readonly initialTab?: 'login' | 'signup'
  readonly onClose: () => void
  readonly className?: string
}

export function AuthModal({
  initialTab = 'login',
  onClose,
  className = '',
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab)
  const { login, signup, user } = useAuth()

  // Loading & Success states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successName, setSuccessName] = useState('')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Signup state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupError, setSignupError] = useState('')

  // Auto-close on signup success after a brief celebration
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose()
      }, 2400)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, onClose])

  function validateIdentifier(val: string): string | null {
    const trimmed = val.trim()
    if (!trimmed) return 'Please enter your email or phone number'
    if (trimmed.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'Please enter a valid email address (e.g. dancer@gmail.com)'
      }
    } else {
      const cleaned = trimmed.replace(/[\s\-()]/g, '')
      if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
        return 'Please enter a valid phone number (at least 7 digits)'
      }
    }
    return null
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setLoginError('')

    const identifierError = validateIdentifier(loginEmail)
    if (identifierError) {
      setLoginError(identifierError)
      return
    }

    if (!loginPassword.trim()) {
      setLoginError('Please enter your password')
      return
    }

    setIsSubmitting(true)
    const error = await login(loginEmail, loginPassword)
    setIsSubmitting(false)

    if (error) {
      setLoginError(error)
    } else {
      onClose()
    }
  }

  async function handleSignup(event: FormEvent) {
    event.preventDefault()
    setSignupError('')

    if (!signupName.trim()) {
      setSignupError('Please enter your full name')
      return
    }

    const identifierError = validateIdentifier(signupEmail)
    if (identifierError) {
      setSignupError(identifierError)
      return
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters')
      return
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    const error = await signup(signupName.trim(), signupEmail.trim(), signupPassword)
    setIsSubmitting(false)

    if (error) {
      setSignupError(error)
    } else {
      setSuccessName(signupName.trim())
      setIsSuccess(true)
    }
  }

  return (
    <div
      className={`auth-modal-backdrop fixed inset-0 z-50 grid place-items-center bg-black/75 backdrop-blur-sm p-4 ${className}`}
      role="presentation"
      onClick={() => !isSuccess && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="auth-modal-panel glass-strong w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[#0d131f]/95 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          /* ── Celebrating Account Creation Screen ── */
          <div className="relative overflow-hidden p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Ambient background glows */}
            <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-48 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 size-48 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Animated checkmark icon badge */}
              <div className="relative size-20 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[2px] shadow-xl shadow-emerald-500/25 mb-5">
                <div className="size-full rounded-full bg-[#0d131f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-emerald-400 animate-bounce">
                    check_circle
                  </span>
                </div>
              </div>

              <h2 id="auth-title" className="font-expanded text-2xl font-bold text-white tracking-wide">
                Account Created Successfully!
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                Welcome to Mudra Dance Academy,{' '}
                <span className="font-bold text-cyan-400">{successName || user?.name}</span>!
              </p>

              {/* Automatic login badge */}
              <div className="mt-5 w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl text-emerald-300">
                      lock_open
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Logged in automatically
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {signupEmail} · Member session active
                    </p>
                  </div>
                </div>
              </div>

              {/* Countdown progress indicator */}
              <div className="mt-6 w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-[pulse_1s_infinite] w-full transition-all" />
                </div>
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  Taking you into Mudra Academy...
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Now →
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header with decorative gradient */}
            <div className="relative overflow-hidden px-8 pb-2 pt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/5" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h2 id="auth-title" className="font-expanded text-2xl font-bold text-white">
                    {tab === 'login' ? 'Welcome back' : 'Join Mudra'}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="grid size-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    aria-label="Close"
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {tab === 'login'
                    ? 'Sign in to your account to continue'
                    : 'Create an account to get started'}
                </p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="relative mx-8 mt-4 flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
              <div
                className="tab-indicator absolute inset-y-1 rounded-lg bg-indigo-600 shadow-md transition-transform duration-200"
                style={{
                  width: 'calc(50% - 4px)',
                  transform: tab === 'login' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))',
                }}
              />
              <button
                type="button"
                onClick={() => { setTab('login'); setLoginError(''); setSignupError('') }}
                className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
                  tab === 'login' ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setLoginError(''); setSignupError('') }}
                className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
                  tab === 'signup' ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Forms */}
            <div className="px-8 pb-8 pt-6">
              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Gmail / Email or Phone Number
                    </label>
                    <input
                      id="login-email"
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. dancer@gmail.com or 9876543210"
                      className={`input-field ${loginError && !loginEmail.trim() ? 'error' : ''}`}
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`input-field ${loginError && !loginPassword.trim() ? 'error' : ''}`}
                      autoComplete="current-password"
                    />
                  </div>
                  {loginError ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                      <Icon name="error" size={16} />
                      {loginError}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-glow mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="signup-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Ananya Patel"
                      className={`input-field ${signupError && !signupName.trim() ? 'error' : ''}`}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Gmail / Email or Phone Number
                    </label>
                    <input
                      id="signup-email"
                      type="text"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. dancer@gmail.com or 9876543210"
                      className={`input-field ${signupError && !signupEmail.trim() ? 'error' : ''}`}
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className={`input-field ${signupError && !signupPassword.trim() ? 'error' : ''}`}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-confirm" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Confirm Password
                    </label>
                    <input
                      id="signup-confirm"
                      type="password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className={`input-field ${signupError && signupPassword !== signupConfirm ? 'error' : ''}`}
                      autoComplete="new-password"
                    />
                  </div>
                  {signupError ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                      <Icon name="error" size={16} />
                      {signupError}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-glow mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}

              <p className="mt-5 text-center text-xs text-slate-400">
                {tab === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('signup'); setLoginError('') }}
                      className="font-bold text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setSignupError('') }}
                      className="font-bold text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

