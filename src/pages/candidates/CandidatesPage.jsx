import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CandidateList from '../../components/candidate/CandidateList'
import CandidateModal from '../../components/candidate/CandidateModal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton'

export default function CandidatesPage({ addToast, pendingIds, addPending, removePending }) {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [stageFilter, setStageFilter] = useState('All')
  const [sortBy, setSortBy] = useState('stage')
  const [searchQ, setSearchQ] = useState('')

  // Load candidates
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await fetch(`/api/candidates?page=1&pageSize=1000`)
      const data = await res.json()
      if (!mounted) return
      // ✅ filter out duplicates (keep first occurrence)
      const seen = new Set()
      const unique = (data.candidates || []).filter(c => {
        if (!c || seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
      setCandidates(unique)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  // ---- API Handlers ----
  async function addCandidate(cand) {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cand),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setCandidates(s => [...s, data.candidate])
      addToast('Candidate added')
    } catch (err) {
      addToast('Failed to add candidate')
    }
  }

  async function updateCandidate(id, updates) {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setCandidates(s => s.map(c => c.id === id ? data.candidate : c))
      addToast('Candidate updated')
    } catch {
      addToast('Failed to update candidate')
    }
  }

  async function deleteCandidate(id) {
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCandidates(s => s.filter(c => c.id !== id))
      addToast('Candidate deleted')
    } catch {
      addToast('Failed to delete candidate')
    }
  }

  // ---- Filtering + Sorting ----
  const filteredSorted = useMemo(() => {
    const q = searchQ.trim().toLowerCase()
    return candidates
      .filter(c => stageFilter === 'All' ? true : (c.stage || 'Applied') === stageFilter)
      .filter(c => !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
        if (sortBy === 'stage') return (a.stage || '').localeCompare(b.stage || '')
        return 0
      })
  }, [candidates, stageFilter, sortBy, searchQ])

  return (
    <div className="p-4">
      {/* Top row */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 bg-white/75 border border-gray-200 rounded-xl p-2 backdrop-blur-sm backdrop-saturate-150">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search name or email..."
            className="w-full py-2.5 px-3 border border-black rounded-full bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm">
            Stage:
            <select
              className="ml-1.5 py-2.5 px-3 border border-gray-200 rounded-lg bg-white text-slate-900"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option>All</option>
              <option>Applied</option>
              <option>Phone Screen</option>
              <option>Onsite</option>
              <option>Offer</option>
              <option>Hired</option>
              <option>Rejected</option>
            </select>
          </label>
          <label className="text-sm">
            Sort by:
            <select
              className="ml-1.5 py-2.5 px-3 border border-gray-200 rounded-lg bg-white text-slate-900"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="stage">Stage</option>
            </select>
          </label>
          <PrimaryButton size="small" onClick={() => { setModalOpen(true); setEditing(null) }}>
            + Add Candidate
          </PrimaryButton>
        </div>
      </div>

      {/* Candidate List */}
      <CandidateList
        candidates={filteredSorted}
        loading={loading}
        onDelete={deleteCandidate}
        onUpdate={updateCandidate}
        pendingIds={pendingIds}
        onOpenProfile={(c) => navigate('/candidates/' + c.id)}
      />

      {/* Candidate modal */}
      <CandidateModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={addCandidate}
      />

    </div>
  )
}
