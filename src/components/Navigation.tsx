import { useState, useRef, useEffect, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthModal } from './AuthModal'
import { Icon } from './Icon'

interface NavItem {
  readonly to: string
  readonly label: string
}

export const NAV: readonly NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/classes', label: 'Class' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/events', label: 'Events' },
  { to: '/membership', label: 'Membership' },
]

interface SiteHeaderProps {
  readonly className?: string
}

export function SiteHeader({ className = '' }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isLoggedIn, user, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-[#080b0e]/85 backdrop-blur-md transition-all ${className}`}
      >
        <div className="flex w-full items-center justify-between px-6 py-4 sm:px-10 lg:px-16 xl:px-20">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 no-underline group py-1">
            <div className="size-16 sm:size-18 lg:size-20 rounded-2xl overflow-hidden bg-white p-1.5 shadow-xl border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(37,215,218,0.4)] flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Mudra Dance Academy"
                className="size-full object-contain"
              />
            </div>
          </NavLink>

          {/* Floating Pill Center Navigation (Exact Dazlle Style) */}
          <nav
            className="hidden items-center rounded-full border border-white/20 bg-[#0d1216]/90 p-1.5 shadow-2xl backdrop-blur-xl md:flex"
            aria-label="Primary"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-wider no-underline transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 p-1 pr-3 text-white transition-colors hover:bg-white/10"
                  aria-expanded={dropdownOpen}
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="size-8 rounded-full object-cover ring-1 ring-[#25d7da]"
                  />
                  <span className="hidden text-xs font-bold xl:inline">{user?.name}</span>
                  <Icon name="expand_more" size={16} className="text-white/60" />
                </button>

                {dropdownOpen ? (
                  <div className="profile-dropdown glass-strong absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1216]/95 py-2 shadow-2xl backdrop-blur-2xl">
                    <div className="border-b border-white/5 px-4 py-2.5">
                      <p className="text-xs font-bold text-white">{user?.name}</p>
                      <p className="text-[11px] text-white/50">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/membership')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/5 hover:text-white"
                    >
                      <Icon name="card_membership" size={16} />
                      Membership
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/schedule')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/5 hover:text-white"
                    >
                      <Icon name="calendar_today" size={16} />
                      Schedule
                    </button>
                    <div className="my-1 border-t border-white/5" />
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10"
                    >
                      <Icon name="logout" size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setAuthModal('login')}
                  className="rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModal('signup')}
                  className="rounded-full bg-[#25d7da] px-5 py-2 text-xs font-black uppercase tracking-wider text-[#080b0e] shadow-md transition-all hover:bg-white hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Circular Hamburger Button (Exact Dazlle right button) */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all hover:bg-white/15"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            >
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen ? (
          <nav className="flex flex-col gap-2 border-t border-white/10 bg-[#080b0e]/95 px-6 py-6 sm:px-10 md:hidden backdrop-blur-2xl">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest no-underline transition-colors ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-4 border-t border-white/10 pt-4">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={user?.avatar} alt={user?.name} className="size-8 rounded-full" />
                    <span className="text-xs font-bold text-white">{user?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="text-xs font-bold uppercase text-red-400"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setAuthModal('login')
                    }}
                    className="rounded-full border border-white/20 py-2.5 text-xs font-black uppercase tracking-wider text-white"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setAuthModal('signup')
                    }}
                    className="rounded-full bg-[#25d7da] py-2.5 text-xs font-black uppercase tracking-wider text-[#080b0e]"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </nav>
        ) : null}
      </header>

      {/* Auth Modal */}
      {authModal ? (
        <AuthModal initialTab={authModal} onClose={() => setAuthModal(null)} />
      ) : null}
    </>
  )
}

interface PageSectionProps {
  readonly children: ReactNode
  readonly className?: string
}

export function PageSection({ children, className = '' }: PageSectionProps) {
  return (
    <div className={`w-full px-6 sm:px-10 lg:px-16 xl:px-20 ${className}`}>
      {children}
    </div>
  )
}
