import React, { useEffect, useState } from 'react'
import JobsPage from './pages/jobs/JobsPage'
import JobDetailsPage from './pages/jobs/JobDetailsPage'
import CandidatesPage from './pages/candidates/CandidatesPage'
import KanbanPage from './pages/kanban/KanbanPage'
import CandidateProfilePage from './pages/candidates/CandidateProfilePage'
import AssessmentsPage from './pages/assessments/AssessmentsPage'
import AssessmentBuilderPage from './pages/assessments/AssessmentBuilderPage'
import AssessmentRunnerPage from './pages/assessments/AssessmentRunnerPage'
import LoginPage from './pages/login/LoginPage'
import HRGate from './components/auth/HRGate'
import Toast from './components/common/Toast'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import ArchivedList from './components/jobs/ArchivedList'

// Buttons
import { LinkButton } from './components/common/buttons/LinkButton'
import { PrimaryButton } from './components/common/buttons/PrimaryButton'

export default function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [pendingIds, setPendingIds] = useState(new Set())
  const [toasts, setToasts] = useState([])
  const [selectedJob, setSelectedJob] = useState(null);
  const [showArchived, setShowArchived] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const isLoggedIn = () => {
    try {
      const raw = localStorage.getItem('hr_session')
      if (!raw) return false
      const s = JSON.parse(raw)
      return !!s?.ok
    } catch {
      return false
    }
  }

  // Toast helpers
  const addToast = (message, durationMs = 5000) => {
    const now = Date.now()
    const id = `toast-${now}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((t) => [...t, { id, message, expiresAt: now + durationMs }])
  }

  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now()
      setToasts((list) => list.filter((x) => x.expiresAt && x.expiresAt > now))
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const addPending = (id) => setPendingIds((s) => new Set([...s, String(id)]))
  const removePending = (id) => setPendingIds((s) => { const ns = new Set(s); ns.delete(String(id)); return ns })

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (err) {
      console.error('Failed to fetch jobs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const bulkUnarchive = async (ids = []) => {
    const prevJobs = jobs
    setJobs((prev) => prev.map((j) => (ids.includes(String(j.id)) ? { ...j, archived: false } : j)))
    try {
      const res = await fetch('/api/jobs/bulk-unarchive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      if (data.jobs) {
        const returnedIds = new Set(data.jobs.map((j) => String(j.id)))
        setJobs((prev) => prev.map((j) => returnedIds.has(String(j.id)) ? { ...j, archived: false } : j))
      }
    } catch {
      setJobs(prevJobs)
      addToast('Failed to unarchive selected jobs')
    }
  }

  // Show navbar only when logged in
  const showNavbar = isLoggedIn() && location.pathname.startsWith('')

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-extrabold cursor-default">TalentFlow</div>

            <LinkButton to="/jobs" onClick={() => navigate('/jobs')}>Jobs</LinkButton>
            <LinkButton to="/candidates" onClick={() => navigate('/candidates')}>Candidates</LinkButton>
            <LinkButton to="/assessments" onClick={() => navigate('/assessments')}>Assessments</LinkButton>
            <LinkButton to="/kanban" onClick={() => navigate('/kanban')}>Kanban</LinkButton>

          </div>

          <PrimaryButton
            onClick={() => { localStorage.removeItem('hr_session'); navigate('/login'); }}
            size="small"
          >
            Logout
          </PrimaryButton>
        </div>
      )}

      <div className="flex-1">
        <Routes>
          {/* Login page */}
          <Route
            path="*"
            element={isLoggedIn() ? <Navigate to="/jobs" replace /> : <Navigate to="/login" replace />}
          />
          <Route path='/login' element={isLoggedIn()?<Navigate to="/jobs" replace />:<LoginPage />} />

          {/* HR Routes */}
          <Route path="/jobs" element={<HRGate><JobsPage search={query} jobs={jobs} onNavigate={(job) => { setSelectedJob(job);  navigate(`/jobs/${job.id}`);  }} type={filterType} showArchived={showArchived} setShowArchived={setShowArchived} /></HRGate>} />
          <Route path="/jobs/:jobId" element={<HRGate><JobDetailsPage job={selectedJob} /></HRGate>} />
          <Route path="/archived" element={<HRGate><ArchivedList jobs={jobs} onBulkUnarchive={bulkUnarchive} loading={loading} /></HRGate>} />
          <Route path="/candidates" element={<HRGate><CandidatesPage addToast={addToast} pendingIds={pendingIds} addPending={addPending} removePending={removePending} /></HRGate>} />
          <Route path="/candidates/:candidateId" element={<HRGate><CandidateProfilePage addToast={addToast} /></HRGate>} />
          <Route path="/kanban" element={<HRGate><KanbanPage addToast={addToast} pendingIds={pendingIds} addPending={addPending} removePending={removePending} /></HRGate>} />
          <Route path="/assessments" element={<HRGate><AssessmentsPage jobs={jobs}/></HRGate>} />
          <Route path="/assessments/:jobId" element={<HRGate><AssessmentBuilderPage /></HRGate>} />
          <Route path="/assessments/:jobId/run" element={<HRGate><AssessmentRunnerPage /></HRGate>} />
        </Routes>
      </div>

      <Toast
        toasts={toasts}
        onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
        autoDismiss
        expirationInterval={3000}
      />
    </div>
  )
}
