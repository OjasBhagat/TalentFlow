// CandidateModal.js
import React, { useState, useEffect } from 'react'
import { SecondaryButton } from '../common/buttons/SecondaryButton'
import { PrimaryButton } from '../common/buttons/PrimaryButton'
import { CANDIDATE_STAGES } from '../../lib/storage'

export default function CandidateModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState(CANDIDATE_STAGES[0])
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setEmail(initial.email || '')
      setStage(initial.stage || CANDIDATE_STAGES[0])
    } else {
      setName('')
      setEmail('')
      setStage(CANDIDATE_STAGES[0])
    }
  }, [initial, open])

  const submit = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    const result = await onSave({ name: name.trim(), email: email.trim(), stage })
    if (!result?.ok) {
      setError(result?.error || 'Failed to save candidate')
      return
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 flex flex-col gap-4">
        <h3 className="text-xl font-semibold">{initial ? 'Edit Candidate' : 'Add Candidate'}</h3>
        <input
          placeholder="Candidate name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="py-2.5 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-2.5 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="py-2.5 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {CANDIDATE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {error && <span className="text-red-600 text-sm">{error}</span>}
        <div className="flex justify-end gap-2 mt-2">
          <SecondaryButton size="small" onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton size="small" onClick={submit}>{initial ? 'Save' : 'Add'}</PrimaryButton>
        </div>
      </div>
    </div>
  )
}
