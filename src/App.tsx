import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AcademyProvider } from './context/AcademyContext'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { ClassesPage } from './pages/ClassesPage'
import { SchedulePage } from './pages/SchedulePage'
import { MembershipPage } from './pages/MembershipPage'
import { AdminPage } from './pages/AdminPage'

interface AppProps {
  readonly className?: string
}

function App({ className = '' }: AppProps) {
  return (
    <div className={className}>
      <AuthProvider>
        <AcademyProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/admin" element={<AdminPage />} />
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/classes" element={<ClassesPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AcademyProvider>
      </AuthProvider>
    </div>
  )
}

export default App
