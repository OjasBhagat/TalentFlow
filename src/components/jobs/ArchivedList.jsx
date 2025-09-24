import Toast from '../common/Toast'
import React, { useState } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'

export default function ArchivedList({ jobs = [], onBulkUnarchive, loading }) {
  const archived = jobs.filter((j) => j.archived === true)
  const [selected, setSelected] = useState(new Set())

  const toggle = (id) => {
    setSelected((s) => {
      const ns = new Set(s)
      if (ns.has(id)) ns.delete(id)
      else ns.add(id)
      return ns
    })
  }

  const selectAll = () => setSelected(new Set(archived.map((j) => String(j.id))))
  const clearAll = () => setSelected(new Set())

  const doBulk = async () => {
    if (selected.size === 0) return
    setConfirmOpen(true)
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  const confirmBulk = async () => {
    const ids = Array.from(selected)
    await onBulkUnarchive(ids)
    clearAll()
    setConfirmOpen(false)
  }

  if (loading) return (
  <div className="flex justify-center items-center p-8">
    <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
  </div>
);
  if (archived.length === 0) return <p>No archived jobs</p>

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button className="appearance-none border border-gray-200 bg-white text-gray-900 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out hover:shadow-sm disabled:opacity-55 disabled:cursor-not-allowed" onClick={selectAll}>Select all</button>
        <button className="appearance-none border border-gray-200 bg-white text-gray-900 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out hover:shadow-sm disabled:opacity-55 disabled:cursor-not-allowed" onClick={clearAll}>Clear</button>
        <button className="appearance-none border border-gray-200 bg-white text-gray-900 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out hover:shadow-sm disabled:opacity-55 disabled:cursor-not-allowed" onClick={doBulk} disabled={selected.size === 0}>Unarchive selected ({selected.size})</button>
      </div>
      <ul className="list-none p-0 m-0 w-full">
        {archived.map((job) => (
          <li key={job.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg mb-2 bg-white w-full hover:shadow-lg hover:shadow-gray-900/5 opacity-50 italic">
            <div className="flex gap-2 items-center">
              <input type="checkbox" checked={selected.has(String(job.id))} onChange={() => toggle(String(job.id))} />
              <div>
                <strong>{job.title}</strong>
                <div className="text-gray-500 text-sm">{job.company} • {job.location || 'Remote'}</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button className="appearance-none border border-gray-200 bg-white text-gray-900 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out hover:shadow-sm disabled:opacity-55 disabled:cursor-not-allowed" onClick={() => onBulkUnarchive([String(job.id)])}>Unarchive</button>
              <div className="text-gray-500">{job.id}</div>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog open={confirmOpen} title="Unarchive selected" message={`Unarchive ${selected.size} job(s)?`} onConfirm={confirmBulk} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}
