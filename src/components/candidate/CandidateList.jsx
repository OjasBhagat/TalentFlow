import React, { useState, useMemo } from 'react';
import { CANDIDATE_STAGES } from '../../lib/storage';
import { PrimaryButton } from '../common/buttons/PrimaryButton';
import { SecondaryButton } from '../common/buttons/SecondaryButton';

export default function CandidateList({
  candidates = [],
  loading,
  onDelete,
  onUpdate,
  pendingIds = new Set(),
  searchQuery = '',
  stageFilter = 'All',
  onOpenProfile
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = !searchQuery.trim() ||
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'All' || (c.stage || 'Applied') === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [candidates, searchQuery, stageFilter]);


  

  const startEdit = (candidate) => {
    setEditingId(candidate.id);
    setForm({ name: candidate.name || '', email: candidate.email || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '' });
  };

  const saveEdit = (id) => {
    if (!form.name.trim() || !form.email.trim()) return;
    onUpdate(id, { name: form.name.trim(), email: form.email.trim() });
    cancelEdit();
  };


  if (loading) return (
  <div className="flex justify-center items-center p-8">
    <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
  </div>
);
  if (!filteredCandidates.length) return <div className="p-4 text-center text-gray-500">No candidates found</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 p-2 bg-white border border-gray-200 rounded-md">
        <div className="text-xs text-gray-500">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </div>
      </div>

      {/* Candidate Rows */}
      <ul className="list-none p-0 m-0 w-full space-y-2">
        {filteredCandidates.map(candidate => {
          const isPending = pendingIds.has(String(candidate.id));
          const editing = editingId === candidate.id;

          return (
            <li
              key={`cand-${candidate.id}`} // ✅ unique key
              className={`p-3 border border-gray-200 rounded-md bg-white flex items-center gap-3`}
            >
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex gap-2 items-center">
                    <input
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                      value={form.name}
                      onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                      placeholder="Name"
                    />
                    <input
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                      value={form.email}
                      onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                      placeholder="Email"
                    />
                    <PrimaryButton onClick={() => saveEdit(candidate.id)} size="small" disabled={isPending}>Save</PrimaryButton>
                    <SecondaryButton onClick={cancelEdit} size="small">Cancel</SecondaryButton>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onOpenProfile?.(candidate)}
                    >
                      {candidate.name}
                    </span>
                    <span className="text-xs text-gray-500">{candidate.email}</span>
                  </div>
                )}
              </div>

              <select
                value={candidate.stage || CANDIDATE_STAGES[0]}
                onChange={(e) => onUpdate(candidate.id, { stage: e.target.value })}
                disabled={isPending}
                className="p-2 border border-gray-300 rounded-lg text-xs"
              >
                {CANDIDATE_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
              </select>

              <div className="flex gap-1 items-center">
                {!editing && <SecondaryButton onClick={() => startEdit(candidate)} size="small" color="blue" disabled={isPending}>Edit</SecondaryButton>}
                <SecondaryButton onClick={() => onDelete(candidate.id)} size="small" color="red" disabled={isPending}>Delete</SecondaryButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
