import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  api,
  type AdminStatsResponse,
  type AdminUser,
  type ApiClass,
  type ApiEvent,
  type ApiInstructor,
  type ApiSession,
  type ApiMembershipPlan,
} from '../lib/api'
import { formatInr } from '../lib/format'
import { FileUploadZone } from '../components/FileUploadZone'

type AdminTab =
  | 'dashboard'
  | 'memberships'
  | 'events'
  | 'teachers'
  | 'courses'
  | 'schedule'

export function AdminPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mudra_admin_auth') === 'true'
  })
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoggingIn, setAdminLoggingIn] = useState(false)

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Data states
  const [statsData, setStatsData] = useState<AdminStatsResponse | null>(null)
  const [instructors, setInstructors] = useState<ApiInstructor[]>([])
  const [classes, setClasses] = useState<ApiClass[]>([])
  const [eventsList, setEventsList] = useState<ApiEvent[]>([])
  const [scheduleList, setScheduleList] = useState<ApiSession[]>([])
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [plans, setPlans] = useState<ApiMembershipPlan[]>([])

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Modals state
  const [activeModal, setActiveModal] = useState<
    | null
    | 'new-teacher'
    | 'edit-teacher'
    | 'new-class'
    | 'edit-class'
    | 'new-event'
    | 'edit-event'
    | 'new-session'
    | 'edit-session'
    | 'assign-membership'
  >(null)

  const [selectedTeacher, setSelectedTeacher] = useState<ApiInstructor | null>(null)
  const [selectedClass, setSelectedClass] = useState<ApiClass | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null)
  const [selectedSession, setSelectedSession] = useState<ApiSession | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  // Fetch all admin data
  async function refreshAll() {
    try {
      const [
        statsRes,
        instructorsRes,
        classesRes,
        eventsRes,
        scheduleRes,
        usersRes,
        plansRes,
      ] = await Promise.all([
        api.admin.stats(),
        api.instructors.list(),
        api.classes.list(),
        api.events.list(),
        api.admin.schedule.list(),
        api.admin.users.list(),
        api.membership.plans(),
      ])
      setStatsData(statsRes)
      setInstructors(instructorsRes.instructors)
      setClasses(classesRes.classes)
      setEventsList(eventsRes.events)
      setScheduleList(scheduleRes.sessions)
      setUsersList(usersRes.users)
      setPlans(plansRes.plans)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdminAuthenticated) {
      refreshAll()
    }
  }, [isAdminAuthenticated])

  async function handleAdminLogin(e: FormEvent) {
    e.preventDefault()
    setAdminLoginError('')
    setAdminLoggingIn(true)
    try {
      const res = await api.admin.login({
        username: adminUsername,
        password: adminPassword,
      })
      if (res.success) {
        localStorage.setItem('mudra_admin_auth', 'true')
        setIsAdminAuthenticated(true)
        showToast('Welcome to Mudra Admin')
      } else {
        setAdminLoginError('Invalid administrator credentials')
      }
    } catch (err: any) {
      setAdminLoginError(err.message || 'Invalid administrator credentials')
    } finally {
      setAdminLoggingIn(false)
    }
  }

  function handleAdminLogout() {
    localStorage.removeItem('mudra_admin_auth')
    setIsAdminAuthenticated(false)
    showToast('Admin session terminated')
  }

  function selectTab(tab: AdminTab) {
    setActiveTab(tab)
    setIsMobileNavOpen(false)
  }

  // ────────────────────── Unauthenticated Admin Gate ──────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
        {/* Modern ambient backdrop glows */}
        <div className="absolute -top-40 -left-40 size-72 sm:size-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 size-72 sm:size-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#111827]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3 sm:mb-4">
              <span className="material-symbols-outlined text-xl sm:text-2xl">shield_lock</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Mudra Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Administrative Console & Control Center
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Username / Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Security Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter security password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {adminLoginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2 border border-rose-500/20">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {adminLoginError}
              </div>
            )}

            <button
              type="submit"
              disabled={adminLoggingIn}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              {adminLoggingIn ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Verifying...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-800 text-center">
            <Link
              to="/"
              className="text-xs font-bold text-slate-400 hover:text-indigo-400 uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* ────────────────────── Toast ────────────────────── */}
      {toastMessage && (
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-5 py-2.5 sm:py-3 shadow-2xl border border-indigo-500/30 animate-bounce text-xs sm:text-sm">
          <span className="material-symbols-outlined text-emerald-400 text-[18px] sm:text-[20px]">check_circle</span>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ────────────────────── Mobile Drawer Backdrop ────────────────────── */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* ────────────────────── Modern SideNavBar (Desktop & Mobile Slide-Over) ────────────────────── */}
      <aside
        className={`w-64 fixed left-0 top-0 bottom-0 bg-[#0D131F] border-r border-slate-800/80 flex flex-col py-6 px-4 z-50 transition-transform duration-300 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-6 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
              M
            </span>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                Mudra Admin
              </h1>
              <p className="text-[11px] text-slate-400">Academy Console</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          <NavItem
            icon="dashboard"
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => selectTab('dashboard')}
          />
          <NavItem
            icon="card_membership"
            label="Memberships"
            active={activeTab === 'memberships'}
            onClick={() => selectTab('memberships')}
          />
          <NavItem
            icon="event"
            label="Events"
            active={activeTab === 'events'}
            onClick={() => selectTab('events')}
          />
          <NavItem
            icon="school"
            label="Teachers"
            active={activeTab === 'teachers'}
            onClick={() => selectTab('teachers')}
          />
          <NavItem
            icon="auto_stories"
            label="Courses"
            active={activeTab === 'courses'}
            onClick={() => selectTab('courses')}
          />
          <NavItem
            icon="calendar_month"
            label="Schedule"
            active={activeTab === 'schedule'}
            onClick={() => selectTab('schedule')}
          />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileNavOpen(false)
              setSelectedUser(null)
              setActiveModal('assign-membership')
            }}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold py-2.5 sm:py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            New Registration
          </button>
          <Link
            to="/"
            className="w-full border border-slate-800 text-slate-300 text-xs font-semibold py-2.5 rounded-xl uppercase tracking-wider hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Public Site
          </Link>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="w-full text-rose-400 hover:bg-rose-500/10 text-xs font-semibold py-2 rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Lock & Sign Out
          </button>
        </div>
      </aside>

      {/* ────────────────────── Main Content Area ────────────────────── */}
      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden pb-20 lg:pb-0">
        {/* Modern TopAppBar */}
        <header className="bg-[#0D131F]/90 backdrop-blur-xl sticky top-0 border-b border-slate-800/80 flex justify-between items-center px-4 sm:px-6 lg:px-10 h-16 sm:h-20 w-full z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger button for phone screens */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <span className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-none">
              Mudra Admin
            </span>
            <span className="hidden sm:inline-block text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold tracking-wider">
              Control Panel
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across portal..."
                className="pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-500 w-48 lg:w-64 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null)
                  setActiveModal('assign-membership')
                }}
                className="sm:hidden size-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20"
                title="Register student"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Admin"
                  className="size-8 sm:size-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-white">Lead Administrator</p>
                  <p className="text-[11px] text-slate-400">admin@mudra</p>
                </div>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Sign Out Admin"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Search bar for phone screens */}
        <div className="p-4 md:hidden bg-[#090D16] border-b border-slate-800/80">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, classes, events..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Tab Content Canvas */}
        <div className="p-4 sm:p-6 lg:p-10 flex-1 w-full max-w-full overflow-x-hidden">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">
                progress_activity
              </span>
              <p className="text-sm font-semibold">Loading Mudra administrative data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  stats={statsData}
                  onNavigateTab={setActiveTab}
                  onQuickRegister={() => {
                    setSelectedUser(null)
                    setActiveModal('assign-membership')
                  }}
                />
              )}

              {activeTab === 'memberships' && (
                <MembershipsTab
                  users={usersList}
                  searchQuery={searchQuery}
                  onAssignMembership={(user) => {
                    setSelectedUser(user)
                    setActiveModal('assign-membership')
                  }}
                  onRefresh={refreshAll}
                  showToast={showToast}
                />
              )}

              {activeTab === 'events' && (
                <EventsTab
                  events={eventsList}
                  instructors={instructors}
                  searchQuery={searchQuery}
                  onCreateEvent={() => {
                    setSelectedEvent(null)
                    setActiveModal('new-event')
                  }}
                  onEditEvent={(event) => {
                    setSelectedEvent(event)
                    setActiveModal('edit-event')
                  }}
                  onRefresh={refreshAll}
                  showToast={showToast}
                />
              )}

              {activeTab === 'teachers' && (
                <TeachersTab
                  instructors={instructors}
                  searchQuery={searchQuery}
                  onCreateTeacher={() => {
                    setSelectedTeacher(null)
                    setActiveModal('new-teacher')
                  }}
                  onEditTeacher={(t) => {
                    setSelectedTeacher(t)
                    setActiveModal('edit-teacher')
                  }}
                  onRefresh={refreshAll}
                  showToast={showToast}
                />
              )}

              {activeTab === 'courses' && (
                <CoursesTab
                  classes={classes}
                  instructors={instructors}
                  searchQuery={searchQuery}
                  onCreateClass={() => {
                    setSelectedClass(null)
                    setActiveModal('new-class')
                  }}
                  onEditClass={(c) => {
                    setSelectedClass(c)
                    setActiveModal('edit-class')
                  }}
                  onRefresh={refreshAll}
                  showToast={showToast}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleTab
                  sessions={scheduleList}
                  searchQuery={searchQuery}
                  onCreateSession={() => {
                    setSelectedSession(null)
                    setActiveModal('new-session')
                  }}
                  onEditSession={(s) => {
                    setSelectedSession(s)
                    setActiveModal('edit-session')
                  }}
                  onRefresh={refreshAll}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </div>

        {/* ────────────────────── Mobile Bottom Navigation Bar ────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0D131F]/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex justify-around items-center">
          <MobileBottomNavItem
            icon="dashboard"
            label="Overview"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <MobileBottomNavItem
            icon="card_membership"
            label="Members"
            active={activeTab === 'memberships'}
            onClick={() => setActiveTab('memberships')}
          />
          <MobileBottomNavItem
            icon="event"
            label="Events"
            active={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
          />
          <MobileBottomNavItem
            icon="auto_stories"
            label="Classes"
            active={activeTab === 'courses'}
            onClick={() => setActiveTab('courses')}
          />
          <MobileBottomNavItem
            icon="calendar_month"
            label="Schedule"
            active={activeTab === 'schedule'}
            onClick={() => setActiveTab('schedule')}
          />
          <MobileBottomNavItem
            icon="menu"
            label="More"
            active={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(true)}
          />
        </nav>
      </main>

      {/* ────────────────────── MODALS ────────────────────── */}

      {/* 1. Teacher Modal */}
      {(activeModal === 'new-teacher' || activeModal === 'edit-teacher') && (
        <TeacherModal
          teacher={selectedTeacher}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
            refreshAll()
            showToast(selectedTeacher ? 'Teacher profile updated' : 'New teacher registered')
          }}
        />
      )}

      {/* 2. Class / Course Modal */}
      {(activeModal === 'new-class' || activeModal === 'edit-class') && (
        <ClassModal
          danceClass={selectedClass}
          instructors={instructors}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
            refreshAll()
            showToast(selectedClass ? 'Class batch updated' : 'New class batch created')
          }}
        />
      )}

      {/* 3. Event Modal */}
      {(activeModal === 'new-event' || activeModal === 'edit-event') && (
        <EventModal
          event={selectedEvent}
          instructors={instructors}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
            refreshAll()
            showToast(selectedEvent ? 'Event updated' : 'Event published')
          }}
        />
      )}

      {/* 4. Schedule Session Modal */}
      {(activeModal === 'new-session' || activeModal === 'edit-session') && (
        <SessionModal
          session={selectedSession}
          classes={classes}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
            refreshAll()
            showToast(selectedSession ? 'Session updated' : 'Session scheduled')
          }}
        />
      )}

      {/* 5. Assign Membership Modal */}
      {activeModal === 'assign-membership' && (
        <AssignMembershipModal
          user={selectedUser}
          users={usersList}
          plans={plans}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null)
            refreshAll()
            showToast('Membership plan granted successfully')
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS & TABS
// ─────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
        active
          ? 'text-white bg-indigo-600/15 border-r-2 border-indigo-500 shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <span
        className={`material-symbols-outlined text-[19px] ${
          active ? 'text-indigo-400' : 'text-slate-500'
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}

function MobileBottomNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
        active ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="text-[10px] font-bold mt-0.5">{label}</span>
    </button>
  )
}

// ────────────────────── TAB 1: DASHBOARD OVERVIEW ──────────────────────
function DashboardTab({
  stats,
  onNavigateTab,
  onQuickRegister,
}: {
  stats: AdminStatsResponse | null
  onNavigateTab: (tab: AdminTab) => void
  onQuickRegister: () => void
}) {
  const activeCount = stats?.stats.activeMembers ?? 0
  const monthlyRevenue = stats?.stats.monthlyRevenue ?? '₹4.2L'
  const upcomingEvents = stats?.stats.upcomingEvents ?? 0
  const todayClasses = stats?.stats.todayClasses ?? 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            Dashboard Overview
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time analytics and academy operational stream.
          </p>
        </div>
        <button
          type="button"
          onClick={onQuickRegister}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 self-start w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Register Student
        </button>
      </div>

      {/* Modern Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {/* Metric 1 */}
        <div className="bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm hover:border-indigo-500/40 transition-all group">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl sm:text-2xl">groups</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase">
              +12%
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Members
          </p>
          <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {activeCount.toLocaleString()}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm hover:border-cyan-500/40 transition-all group">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl sm:text-2xl">payments</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase">
              +8%
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Monthly Revenue
          </p>
          <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {monthlyRevenue}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm hover:border-amber-500/40 transition-all group">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl sm:text-2xl">event_upcoming</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase">
              This Month
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Upcoming Events
          </p>
          <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {upcomingEvents < 10 ? `0${upcomingEvents}` : upcomingEvents}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all group">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl sm:text-2xl">play_lesson</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase">
              Active
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Classes
          </p>
          <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {todayClasses < 10 ? `0${todayClasses}` : todayClasses}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-[#111827] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">Recent Transactions & Bookings</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('memberships')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
            >
              View All Students →
            </button>
          </div>

          <ul className="space-y-3">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <div className="size-9 sm:size-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">payments</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-200">
                      <span className="font-bold text-white">{tx.title}</span> —{' '}
                      <span className="font-semibold text-emerald-400">
                        {formatInr(tx.amountInr)}
                      </span>
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                      {new Date(tx.createdAt).toLocaleString()} · {tx.status}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors">
                  <div className="size-9 sm:size-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">person_add</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-200">
                      <span className="font-bold text-white">Ananya Patel</span> enrolled in{' '}
                      <span className="font-semibold text-indigo-300">Kathak Foundations</span>.
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">10 mins ago</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors">
                  <div className="size-9 sm:size-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">book_online</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-200">
                      <span className="font-bold text-white">Rahul Verma</span> booked private studio session.
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">2 hours ago</p>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Upcoming Schedule Snippet */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-white">Next Up In Studio</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 sm:p-4 bg-slate-900/60 border border-slate-800 rounded-xl border-l-4 border-l-indigo-500 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white text-xs sm:text-sm">Kathak Foundations</h4>
                  <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-indigo-500/20">
                    Studio A
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">with Priya Sharma</p>
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  08:30 AM - 09:30 AM
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-900/60 border border-slate-800 rounded-xl border-l-4 border-l-cyan-500 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white text-xs sm:text-sm">Bharatanatyam Technique</h4>
                  <span className="bg-cyan-500/10 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-cyan-500/20">
                    Studio B
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">with Meera Iyer</p>
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  04:00 PM - 05:15 PM
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('schedule')}
            className="w-full mt-6 py-2.5 sm:py-3 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors"
          >
            Manage Timetable →
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────── TAB 2: MEMBERSHIPS ──────────────────────
function MembershipsTab({
  users,
  searchQuery,
  onAssignMembership,
  onRefresh,
  showToast,
}: {
  users: AdminUser[]
  searchQuery: string
  onAssignMembership: (user: AdminUser) => void
  onRefresh: () => void
  showToast: (msg: string) => void
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'no-plan'>('all')

  function getMembershipStatus(u: AdminUser): 'active' | 'expired' | 'no-plan' {
    const active = u.memberships?.find((m) => m.status === 'active')
    if (active) {
      if (active.renewsOn) {
        const isPast = new Date(active.renewsOn).getTime() < new Date().setHours(0, 0, 0, 0)
        if (isPast) return 'expired'
      }
      return 'active'
    }
    const hasExpired = u.memberships?.some((m) => m.status === 'expired')
    if (hasExpired) return 'expired'
    return 'no-plan'
  }

  const counts = useMemo(() => {
    let active = 0
    let expired = 0
    let noPlan = 0
    for (const u of users) {
      const s = getMembershipStatus(u)
      if (s === 'active') active++
      else if (s === 'expired') expired++
      else noPlan++
    }
    return { all: users.length, active, expired, noPlan }
  }, [users])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const status = getMembershipStatus(u)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && status === 'active') ||
        (statusFilter === 'expired' && status === 'expired') ||
        (statusFilter === 'no-plan' && status === 'no-plan')

      const matchesQuery =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.handle.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesQuery
    })
  }, [users, searchQuery, statusFilter])

  async function handleTierChange(userId: string, tier: string) {
    try {
      await api.admin.users.update(userId, { tier })
      onRefresh()
      showToast('Student tier updated')
    } catch {
      showToast('Failed to update tier')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            Member Registry & Subscriptions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage student memberships, subscription tiers, renewal dates, and expired plans.
          </p>
        </div>
      </div>

      {/* ── Status Filters ── */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <span>All Students</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-emerald-400 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          <span>Active Plans</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('expired')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            statusFilter === 'expired'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-900 text-rose-400 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span className="size-2 rounded-full bg-rose-400" />
          <span>Expired Plans</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">
            {counts.expired}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('no-plan')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            statusFilter === 'no-plan'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <span>No Plan</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">
            {counts.noPlan}
          </span>
        </button>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Student</th>
                <th className="py-4 px-5">Tier</th>
                <th className="py-4 px-5">Plan Status</th>
                <th className="py-4 px-5">Plan Details</th>
                <th className="py-4 px-5">Renews / Expired On</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((u) => {
                const status = getMembershipStatus(u)
                const activeMembership = u.memberships?.find((m) => m.status === 'active')
                const latestMembership = u.memberships?.[0]
                const displayPlan = activeMembership?.plan || latestMembership?.plan

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366F1&color=fff`
                          }
                          alt={u.name}
                          className="size-9 sm:size-10 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs sm:text-sm truncate">{u.name}</p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          <p className="text-[11px] text-slate-500">{u.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={u.tier}
                        onChange={(e) => handleTierChange(u.id, e.target.value)}
                        className="text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 py-1.5 px-2.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      >
                        <option value="Free">Free</option>
                        <option value="Member">Member</option>
                        <option value="Elite Member">Elite Member</option>
                      </select>
                    </td>
                    <td className="py-4 px-5">
                      {status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      )}
                      {status === 'expired' && (
                        <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          <span className="size-2 rounded-full bg-rose-400" />
                          Expired
                        </span>
                      )}
                      {status === 'no-plan' && (
                        <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                          No Plan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {displayPlan ? (
                        <span className="font-semibold text-xs text-indigo-300 whitespace-nowrap">
                          {displayPlan.label} ({displayPlan.months} mo)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {activeMembership?.renewsOn || latestMembership?.renewsOn || '—'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => onAssignMembership(u)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
                      >
                        {status === 'expired' ? 'Renew Plan' : 'Grant Plan'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ────────────────────── TAB 3: EVENTS ──────────────────────
function EventsTab({
  events,
  instructors,
  searchQuery,
  onCreateEvent,
  onEditEvent,
  onRefresh,
  showToast,
}: {
  events: ApiEvent[]
  instructors: ApiInstructor[]
  searchQuery: string
  onCreateEvent: () => void
  onEditEvent: (event: ApiEvent) => void
  onRefresh: () => void
  showToast: (msg: string) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const catOk = selectedCategory === 'All' || e.category === selectedCategory
      const queryOk =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase())
      return catOk && queryOk
    })
  }, [events, selectedCategory, searchQuery])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await api.admin.events.delete(id)
      onRefresh()
      showToast('Event removed')
    } catch {
      showToast('Failed to delete event')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            Events & Masterclasses
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Publish and manage workshops, recitals, and company auditions.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateEvent}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 self-start w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Event
        </button>
      </div>

      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2">
        {['All', 'Workshops', 'Performances', 'Auditions'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filtered.map((e) => {
          const instructor = instructors.find((i) => i.id === e.instructorId)
          return (
            <div
              key={e.id}
              className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="relative h-44 sm:h-48 overflow-hidden bg-black">
                  <img
                    src={
                      e.imageUrl ||
                      'https://images.unsplash.com/photo-1547153760-18fcfa26afdc?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={e.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {e.category}
                    </span>
                    {e.isFeatured && (
                      <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-white">{e.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{e.description}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-indigo-400 shrink-0">
                        calendar_today
                      </span>
                      <span className="font-semibold text-slate-300">{e.startDate}</span> · {e.timeLabel}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-indigo-400 shrink-0">
                        location_on
                      </span>
                      <span className="truncate">{e.venue}</span>
                    </p>
                    {instructor && (
                      <p className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-indigo-400 shrink-0">
                          person
                        </span>
                        Guru: {instructor.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <span className="text-base sm:text-lg font-black text-cyan-400">
                  {e.priceInr === 0 ? 'Free' : formatInr(e.priceInr)}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditEvent(e)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit event"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete event"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ────────────────────── TAB 4: TEACHERS ──────────────────────
function TeachersTab({
  instructors,
  searchQuery,
  onCreateTeacher,
  onEditTeacher,
  onRefresh,
  showToast,
}: {
  instructors: ApiInstructor[]
  searchQuery: string
  onCreateTeacher: () => void
  onEditTeacher: (teacher: ApiInstructor) => void
  onRefresh: () => void
  showToast: (msg: string) => void
}) {
  const filtered = useMemo(() => {
    return instructors.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [instructors, searchQuery])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this teacher?')) return
    try {
      await api.admin.instructors.delete(id)
      onRefresh()
      showToast('Teacher removed')
    } catch {
      showToast('Cannot delete teacher with existing classes or events')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            Faculty & Gurus
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage dance faculty, master mentors, titles, and lineage details.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateTeacher}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 self-start w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add New Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-[#111827] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col items-center text-center hover:border-slate-700 transition-all relative group"
          >
            <div className="absolute top-4 right-4 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEditTeacher(t)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit teacher"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete teacher"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>

            <img
              src={
                t.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=6366F1&color=fff`
              }
              alt={t.name}
              className="size-20 sm:size-24 rounded-full object-cover ring-4 ring-indigo-500/20 mb-3 sm:mb-4"
            />
            <h3 className="text-base sm:text-lg font-bold text-white">{t.name}</h3>
            <span className="text-xs font-semibold text-indigo-400 mt-1 bg-indigo-500/10 border border-indigo-500/20 px-3 py-0.5 rounded-full">
              {t.title}
            </span>
            <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
              {t.bio || 'Faculty mentor at Mudra Dance Academy.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────── TAB 5: COURSES (CLASSES) ──────────────────────
function CoursesTab({
  classes,
  instructors,
  searchQuery,
  onCreateClass,
  onEditClass,
  onRefresh,
  showToast,
}: {
  classes: ApiClass[]
  instructors: ApiInstructor[]
  searchQuery: string
  onCreateClass: () => void
  onEditClass: (cls: ApiClass) => void
  onRefresh: () => void
  showToast: (msg: string) => void
}) {
  const filtered = useMemo(() => {
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.level.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [classes, searchQuery])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this class batch?')) return
    try {
      await api.admin.classes.delete(id)
      onRefresh()
      showToast('Class batch removed')
    } catch {
      showToast('Failed to delete class')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            Class Curriculum & Batches
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage classical and contemporary disciplines, capacity, and weekday schedules.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateClass}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 self-start w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filtered.map((c) => {
          const instructor = instructors.find((i) => i.id === c.instructorId)
          return (
            <div
              key={c.id}
              className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="relative h-40 sm:h-44 overflow-hidden bg-black">
                  <img
                    src={
                      c.imageUrl ||
                      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={c.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {c.style}
                    </span>
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {c.level}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.blurb}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-indigo-400 shrink-0">
                        person
                      </span>
                      Guru: <span className="font-semibold text-slate-200">{instructor?.name || 'Assigned'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-indigo-400 shrink-0">
                        calendar_view_week
                      </span>
                      Days:{' '}
                      <span className="font-semibold text-slate-200 truncate">
                        {c.weekdays && c.weekdays.length > 0 ? c.weekdays.join(', ') : 'Weekly'}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-indigo-400 shrink-0">
                        groups
                      </span>
                      Capacity: {c.capacity} students ({c.durationMin} min)
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <span className="text-base sm:text-lg font-black text-cyan-400">
                  {formatInr(c.priceInr)}
                  <span className="text-[10px] text-slate-500 font-normal block">/month</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditClass(c)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit class"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete class"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ────────────────────── TAB 6: SCHEDULE ──────────────────────
function ScheduleTab({
  sessions,
  searchQuery,
  onCreateSession,
  onEditSession,
  onRefresh,
  showToast,
}: {
  sessions: ApiSession[]
  searchQuery: string
  onCreateSession: () => void
  onEditSession: (session: ApiSession) => void
  onRefresh: () => void
  showToast: (msg: string) => void
}) {
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const clsName = s.class?.name || ''
      return (
        clsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.date.includes(searchQuery)
      )
    })
  }, [sessions, searchQuery])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this scheduled session?')) return
    try {
      await api.admin.schedule.delete(id)
      onRefresh()
      showToast('Session removed from timetable')
    } catch {
      showToast('Failed to delete session')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            Studio Schedule & Timetable
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Assign studio time slots and monitor live session statuses.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateSession}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 self-start w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">more_time</span>
          Schedule Session
        </button>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Class / Batch</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Time Slot</th>
                <th className="py-4 px-5">Studio</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <p className="font-bold text-white text-xs sm:text-sm">{s.class?.name || s.classId}</p>
                    <p className="text-xs text-slate-400">
                      {s.class?.instructor?.name || 'Assigned Guru'} · {s.class?.style}
                    </p>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-300 font-mono text-xs sm:text-sm">{s.date}</td>
                  <td className="py-4 px-5 font-bold text-cyan-400 font-mono text-xs sm:text-sm">
                    {s.startTime} - {s.endTime}
                  </td>
                  <td className="py-4 px-5">
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap">
                      {s.studio}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap ${
                        s.status === 'in-progress'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : s.status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => onEditSession(s)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No sessions scheduled yet. Click "Schedule Session" above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MODERN OBSIDIAN MODALS
// ─────────────────────────────────────────────────────────────

function ModalWrapper({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] text-white w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function TeacherModal({
  teacher,
  onClose,
  onSuccess,
}: {
  teacher: ApiInstructor | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState(teacher?.name || '')
  const [title, setTitle] = useState(teacher?.title || '')
  const [avatarUrl, setAvatarUrl] = useState(teacher?.avatarUrl || '')
  const [bio, setBio] = useState(teacher?.bio || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (teacher) {
        await api.admin.instructors.update(teacher.id, { name, title, avatarUrl, bio })
      } else {
        await api.admin.instructors.create({ name, title, avatarUrl, bio })
      }
      onSuccess()
    } catch {
      alert('Error saving teacher details')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title={teacher ? 'Edit Guru Profile' : 'Register New Dance Guru'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Teacher Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Guru Radhika Nair"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Title / Faculty Role</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Kathak Lead & Choreographer"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <FileUploadZone
          label="Avatar / Profile Photo"
          value={avatarUrl}
          onChange={setAvatarUrl}
          accept="image"
          entity="teachers"
        />
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Biography / Lineage</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief bio or Gharana lineage background..."
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/25"
        >
          {saving ? 'Saving...' : teacher ? 'Update Teacher' : 'Register Teacher'}
        </button>
      </form>
    </ModalWrapper>
  )
}

function ClassModal({
  danceClass,
  instructors,
  onClose,
  onSuccess,
}: {
  danceClass: ApiClass | null
  instructors: ApiInstructor[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState(danceClass?.name || '')
  const [style, setStyle] = useState(danceClass?.style || 'kathak')
  const [level, setLevel] = useState(danceClass?.level || 'Beginner')
  const [instructorId, setInstructorId] = useState(
    danceClass?.instructorId || instructors[0]?.id || '',
  )
  const [priceInr, setPriceInr] = useState(danceClass?.priceInr || 2000)
  const [durationMin, setDurationMin] = useState(danceClass?.durationMin || 60)
  const [capacity, setCapacity] = useState(danceClass?.capacity || 20)
  const [blurb, setBlurb] = useState(danceClass?.blurb || '')
  const [imageUrl, setImageUrl] = useState(danceClass?.imageUrl || '')
  const [weekdays, setWeekdays] = useState<string[]>(danceClass?.weekdays || ['Mon', 'Wed'])
  const [saving, setSaving] = useState(false)

  const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  function toggleWeekday(day: string) {
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (danceClass) {
        await api.admin.classes.update(danceClass.id, {
          name,
          style,
          level,
          instructorId,
          priceInr,
          durationMin,
          capacity,
          blurb,
          imageUrl,
          weekdays,
        })
      } else {
        await api.admin.classes.create({
          name,
          style,
          level,
          instructorId,
          priceInr,
          durationMin,
          capacity,
          blurb,
          imageUrl,
          weekdays,
        })
      }
      onSuccess()
    } catch {
      alert('Error saving class batch')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title={danceClass ? 'Edit Class Batch' : 'Create Class Batch'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Class Title</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Odissi Abhinaya Foundations"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
            >
              <option value="kathak">Kathak</option>
              <option value="bharatanatyam">Bharatanatyam</option>
              <option value="contemporary">Contemporary</option>
              <option value="odissi">Odissi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Lead Guru</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          >
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.title})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Price (₹/mo)</label>
            <input
              type="number"
              required
              value={priceInr}
              onChange={(e) => setPriceInr(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Duration (min)</label>
            <input
              type="number"
              required
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Capacity</label>
            <input
              type="number"
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Scheduled Days</label>
          <div className="flex flex-wrap gap-2">
            {ALL_WEEKDAYS.map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleWeekday(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  weekdays.includes(day)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <FileUploadZone
          label="Cover Image"
          value={imageUrl}
          onChange={setImageUrl}
          accept="image"
          entity="classes"
        />
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Curriculum Overview</label>
          <textarea
            rows={2}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="Short overview of syllabus and technique..."
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/25"
        >
          {saving ? 'Saving...' : danceClass ? 'Update Class' : 'Create Class Batch'}
        </button>
      </form>
    </ModalWrapper>
  )
}

function EventModal({
  event,
  instructors,
  onClose,
  onSuccess,
}: {
  event: ApiEvent | null
  instructors: ApiInstructor[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [title, setTitle] = useState(event?.title || '')
  const [category, setCategory] = useState(event?.category || 'Workshops')
  const [startDate, setStartDate] = useState(event?.startDate || '2026-09-01')
  const [timeLabel, setTimeLabel] = useState(event?.timeLabel || '10:00 AM')
  const [venue, setVenue] = useState(event?.venue || 'Studio A · Main Hall')
  const [instructorId, setInstructorId] = useState(event?.instructorId || '')
  const [priceInr, setPriceInr] = useState(event?.priceInr || 1500)
  const [isFeatured, setIsFeatured] = useState(event?.isFeatured || false)
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || '')
  const [description, setDescription] = useState(event?.description || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (event) {
        await api.admin.events.update(event.id, {
          title,
          category,
          startDate,
          timeLabel,
          venue,
          instructorId: instructorId || null,
          priceInr,
          isFeatured,
          imageUrl,
          description,
        })
      } else {
        await api.admin.events.create({
          title,
          category,
          startDate,
          timeLabel,
          venue,
          instructorId: instructorId || undefined,
          priceInr,
          isFeatured,
          imageUrl,
          description,
        })
      }
      onSuccess()
    } catch {
      alert('Error saving event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title={event ? 'Edit Masterclass / Event' : 'Create New Event'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Event Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lucknow Gharana Intensive Workshop"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
            >
              <option value="Workshops">Workshops</option>
              <option value="Performances">Performances</option>
              <option value="Auditions">Auditions</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Fee (₹)</label>
            <input
              type="number"
              value={priceInr}
              onChange={(e) => setPriceInr(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Time Label</label>
            <input
              type="text"
              required
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
              placeholder="e.g. 10:00 AM"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Venue / Studio</label>
          <input
            type="text"
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. Studio A · Gomti Nagar"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Lead Guru</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          >
            <option value="">None / Open Audition</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.title})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="feat"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="size-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="feat" className="text-xs font-semibold text-slate-300 cursor-pointer">
            Feature as Highlight Masterclass on Homepage
          </label>
        </div>
        <FileUploadZone
          label="Cover Image / Video"
          value={imageUrl}
          onChange={setImageUrl}
          accept="both"
          entity="events"
        />
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of recital, workshop syllabus, or auditions..."
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/25"
        >
          {saving ? 'Saving...' : event ? 'Update Event' : 'Publish Event'}
        </button>
      </form>
    </ModalWrapper>
  )
}

function SessionModal({
  session,
  classes,
  onClose,
  onSuccess,
}: {
  session: ApiSession | null
  classes: ApiClass[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [classId, setClassId] = useState(session?.classId || classes[0]?.id || '')
  const [date, setDate] = useState(session?.date || new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState(session?.startTime || '09:00:00')
  const [endTime, setEndTime] = useState(session?.endTime || '10:15:00')
  const [studio, setStudio] = useState(session?.studio || 'Studio A')
  const [status, setStatus] = useState(session?.status || 'scheduled')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (session) {
        await api.admin.schedule.update(session.id, {
          classId,
          date,
          startTime,
          endTime,
          studio,
          status,
        })
      } else {
        await api.admin.schedule.create({
          classId,
          date,
          startTime,
          endTime,
          studio,
          status,
        })
      }
      onSuccess()
    } catch {
      alert('Error scheduling session')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title={session ? 'Edit Session' : 'Schedule New Class Session'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Class Batch</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.style} · {c.level})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Start Time</label>
            <input
              type="text"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 09:00:00"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">End Time</label>
            <input
              type="text"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 10:15:00"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Studio</label>
            <select
              value={studio}
              onChange={(e) => setStudio(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
            >
              <option value="Studio A">Studio A</option>
              <option value="Studio B">Studio B</option>
              <option value="Studio C">Studio C</option>
              <option value="Main Hall">Main Hall</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-white text-xs"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/25"
        >
          {saving ? 'Saving...' : session ? 'Update Session' : 'Schedule Session'}
        </button>
      </form>
    </ModalWrapper>
  )
}

function AssignMembershipModal({
  user,
  users,
  plans,
  onClose,
  onSuccess,
}: {
  user: AdminUser | null
  users: AdminUser[]
  plans: ApiMembershipPlan[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [selectedUserId, setSelectedUserId] = useState(user?.id || '')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [planId, setPlanId] = useState(plans[1]?.id || plans[0]?.id || 'plan-3')
  const [startsOn, setStartsOn] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  const selectedUserObj = users.find((u) => u.id === selectedUserId) || user

  const searchResults = useMemo(() => {
    if (!userSearchQuery.trim()) return users.slice(0, 5)
    const q = userSearchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        u.email.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q),
    )
  }, [users, userSearchQuery])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedUserId || !planId) return
    setSaving(true)
    try {
      await api.admin.users.assignMembership({
        userId: selectedUserId,
        planId,
        startsOn,
      })
      onSuccess()
    } catch {
      alert('Error assigning membership plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title="Assign Membership Plan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-sm">
        {/* ── Searchable Student Selector ── */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 tracking-wider">
            Find Student (Search by Name, Phone, or Email)
          </label>

          {selectedUserObj && user ? (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedUserObj.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserObj.name)}&background=6366F1&color=fff`
                  }
                  alt={selectedUserObj.name}
                  className="size-9 sm:size-10 rounded-full object-cover ring-2 ring-slate-800"
                />
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs sm:text-sm truncate">{selectedUserObj.name}</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                    {selectedUserObj.phone ? `📞 ${selectedUserObj.phone} · ` : ''}
                    {selectedUserObj.email}
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase shrink-0">
                {selectedUserObj.tier}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Type name, phone number, or email..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder:text-slate-500"
                />
              </div>

              {/* Matching Students List */}
              <div className="max-h-40 sm:max-h-44 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/90 divide-y divide-slate-800/80 shadow-sm">
                {searchResults.map((u) => {
                  const isSelected = u.id === selectedUserId
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => {
                        setSelectedUserId(u.id)
                        setUserSearchQuery('')
                      }}
                      className={`w-full p-2 sm:p-2.5 text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/20 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <img
                          src={
                            u.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366F1&color=fff`
                          }
                          alt={u.name}
                          className="size-7 sm:size-8 rounded-full object-cover ring-1 ring-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs leading-tight truncate">{u.name}</p>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                            {u.phone ? `📞 ${u.phone} · ` : ''}
                            {u.email}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <span className="material-symbols-outlined text-indigo-400 text-[18px] shrink-0 ml-2">
                          check_circle
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full uppercase shrink-0 ml-2">
                          Select
                        </span>
                      )}
                    </button>
                  )
                })}
                {searchResults.length === 0 && (
                  <p className="p-4 text-center text-xs text-slate-400">
                    No students match that name or phone number.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Student Confirmation */}
        {selectedUserObj && !user && (
          <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
            <p className="text-xs text-indigo-300 truncate mr-2">
              Selected: <strong className="text-white">{selectedUserObj.name}</strong>{' '}
              {selectedUserObj.phone ? `(${selectedUserObj.phone})` : `(${selectedUserObj.email})`}
            </p>
            <button
              type="button"
              onClick={() => setSelectedUserId('')}
              className="text-[11px] font-bold text-rose-400 hover:underline uppercase shrink-0"
            >
              Change
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 tracking-wider">
            Membership Plan
          </label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-xs font-medium text-white"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — {formatInr(p.priceInr)} ({p.batches} batches allowed)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 tracking-wider">
            Activation Date
          </label>
          <input
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-xs font-mono text-white"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !selectedUserId}
          className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-3 sm:py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
        >
          {saving ? 'Processing...' : 'Confirm Plan Activation'}
        </button>
      </form>
    </ModalWrapper>
  )
}
