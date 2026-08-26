import { useState, type FormEvent } from 'react'
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
  const { login, signup } = useAuth()

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

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setLoginError('')

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please fill in all fields')
      return
    }
    if (!loginEmail.includes('@')) {
      setLoginError('Please enter a valid email')
      return
    }

    const error = await login(loginEmail, loginPassword)
    if (error) {
      setLoginError(error)
    } else {
      onClose()
    }
  }

  async function handleSignup(event: FormEvent) {
    event.preventDefault()
    setSignupError('')

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim() || !signupConfirm.trim()) {
      setSignupError('Please fill in all fields')
      return
    }
    if (!signupEmail.includes('@')) {
      setSignupError('Please enter a valid email')
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

    const error = await signup(signupName, signupEmail, signupPassword)
    if (error) {
      setSignupError(error)
    } else {
      onClose()
    }
  }

  return (
    <div
      className={`auth-modal-backdrop fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 ${className}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="auth-modal-panel glass-strong w-full max-w-md overflow-hidden rounded-2xl shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with decorative gradient */}
        <div className="relative overflow-hidden px-8 pb-2 pt-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-spark/5" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <h2 id="auth-title" className="font-expanded text-2xl font-bold">
                {tab === 'login' ? 'Welcome back' : 'Join Mudra'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-lg text-on-variant-light transition-colors hover:bg-surface-container-light hover:text-on-surface-light"
                aria-label="Close"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <p className="mt-1 text-sm text-on-variant-light">
              {tab === 'login'
                ? 'Sign in to your account to continue'
                : 'Create an account to get started'}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="relative mx-8 mt-4 flex rounded-xl bg-surface-dark/60 p-1">
          <div
            className="tab-indicator absolute inset-y-1 rounded-lg bg-primary shadow-lg"
            style={{
              width: 'calc(50% - 4px)',
              transform: tab === 'login' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))',
            }}
          />
          <button
            type="button"
            onClick={() => { setTab('login'); setLoginError(''); setSignupError('') }}
            className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              tab === 'login' ? 'text-on-primary' : 'text-on-variant-light hover:text-on-surface-light'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setLoginError(''); setSignupError('') }}
            className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              tab === 'signup' ? 'text-on-primary' : 'text-on-variant-light hover:text-on-surface-light'
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
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-variant-light">
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
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-variant-light">
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
                className="btn-glow mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-on-primary"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-variant-light">
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
                <label htmlFor="signup-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-variant-light">
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
                <label htmlFor="signup-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-variant-light">
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
                <label htmlFor="signup-confirm" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-variant-light">
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
                className="btn-glow mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-on-primary"
              >
                Create Account
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-xs text-on-variant-light">
            {tab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signup'); setLoginError('') }}
                  className="font-bold text-primary hover:underline"
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
                  className="font-bold text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
