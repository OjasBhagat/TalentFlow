import React, { useState } from 'react';
import { PrimaryButton } from '../common/buttons/PrimaryButton';
import { SecondaryButton } from '../common/buttons/SecondaryButton';

export default function JobList({ jobs, onDelete, onUpdate, onArchive, onReorder, onNavigate, loading, pendingIds = new Set() }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'Full-time' });
  const [dragOverId, setDragOverId] = useState(null);

  const items = Array.isArray(jobs) ? jobs.filter(Boolean) : [];

 

  if (!loading && (!items || items.length === 0))
    return  <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
    </div>

  const startEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title || '',
      company: job.company || 'Default Company',
      location: job.location || 'Remote',
      type: job.type || 'Full-time'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', company: '', location: '', type: 'Full-time' });
  };

  const saveEdit = async (id) => {
    if (!form.title.trim() || !form.company.trim()) return;
    await onUpdate(id, {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      type: form.type
    });
    cancelEdit();
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDragLeave = () => setDragOverId(null);
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const srcId = e.dataTransfer.getData('text/plain');
    setDragOverId(null);
    if (!srcId || String(srcId) === String(targetId)) return;
    if (typeof onReorder === 'function') {
      const srcIndex = items.findIndex((j) => String(j.id) === String(srcId));
      const targetIndex = items.findIndex((j) => String(j.id) === String(targetId));
      if (srcIndex === -1 || targetIndex === -1) return;
      const newJobs = [...items];
      const [moved] = newJobs.splice(srcIndex, 1);
      newJobs.splice(targetIndex, 0, moved);
      onReorder(newJobs.map((j) => String(j.id)));
    }
  };

  const getTagColor = (type) => {
    switch (type) {
      case 'Full-time': return "bg-green-100 text-green-700";
      case 'Part-time': return "bg-yellow-100 text-yellow-700";
      case 'Contract': return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <ul className="list-none p-0 m-0 w-full space-y-3">
      {items.map((job) => (
        <li
          key={job.id}
          draggable
          onDragStart={(e) => handleDragStart(e, job.id)}
          onDragOver={(e) => handleDragOver(e, job.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, job.id)}
          className={`p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition
            ${dragOverId === job.id ? 'outline-2 outline-dashed outline-blue-300 bg-blue-50' : ''}
            ${job.status === 'filled' ? 'opacity-60 line-through' : ''}
            ${job.archived ? 'opacity-50 italic' : ''}`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              {editingId === job.id ? (
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    className="flex-1 py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Job title"
                  />
                  <input
                    className="flex-1 py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.company}
                    onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                    placeholder="Company"
                  />
                  <input
                    className="flex-1 py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.location}
                    onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                    placeholder="Location"
                  />
                  <select
                    className="flex-1 py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.type}
                    onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              ) : (
                <div>
                  <strong
                    className={`block text-lg ${typeof onNavigate === 'function' ? 'cursor-pointer hover:text-blue-600' : ''}`}
                    onClick={() => typeof onNavigate === 'function' && onNavigate(job)}
                  >
                    {job.title}
                  </strong>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-grey-100 text-grey-700 border">{job.company || 'Default Company'}</span>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 border">{job.location || 'Remote'}</span>
                    <span className={`px-2 py-1 rounded-full border ${getTagColor(job.type)}`}>{job.type || 'Full Time'}</span>
                    {job.archived && <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 border">Archived</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              {editingId === job.id ? (
                <>
                  <PrimaryButton onClick={() => saveEdit(job.id)} size="small" disabled={pendingIds.has(String(job.id))}>Save</PrimaryButton>
                  <SecondaryButton onClick={cancelEdit} size="small">Cancel</SecondaryButton>
                </>
              ) : (
                <>
                  <SecondaryButton onClick={() => startEdit(job)} size="small" color="blue" disabled={pendingIds.has(String(job.id))}>Edit</SecondaryButton>
                  <SecondaryButton onClick={() => onDelete(job.id)} size="small" color="red" disabled={pendingIds.has(String(job.id))}>Delete</SecondaryButton>
                  <SecondaryButton onClick={() => typeof onArchive === 'function' && onArchive(job.id, !(job.archived === true))} size="small" color="neutral" disabled={pendingIds.has(String(job.id))}>
                    {job.archived ? 'Unarchive' : 'Archive'}
                  </SecondaryButton>
                  {job.status === 'filled' ? (
                    <SecondaryButton onClick={() => onUpdate(job.id, { status: 'open' })} size="small" color="green" disabled={pendingIds.has(String(job.id))}>Reopen</SecondaryButton>
                  ) : (
                    <SecondaryButton onClick={() => onUpdate(job.id, { status: 'filled' })} size="small" color="green" disabled={pendingIds.has(String(job.id))}>Mark Filled</SecondaryButton>
                  )}
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
