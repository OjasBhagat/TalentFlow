import React, { useState, useEffect } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';

export default function KanbanPage({ addToast, pendingIds, addPending, removePending }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await fetch('/api/candidates?pageSize=1000');
      const data = await res.json();
      if (!mounted) return;
      setCandidates(data.candidates || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function handleUpdate(id, updates, options = {}) {
    const prev = candidates;
    setCandidates((s) => s.map((c) => (String(c.id) === String(id) ? { ...c, ...updates } : c)));
    addPending(id);
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setCandidates((s) => s.map((c) => (String(c.id) === String(id) ? data.candidate : c)));
      if (!options.silent) addToast('Candidate updated');
      return data.candidate;
    } catch {
      setCandidates(prev);
      addToast('Failed to update candidate');
      return null;
    } finally {
      removePending(id);
    }
  }

  return (
    <div className="w-full flex justify-center p-4">
      <div className="overflow-x-auto w-full max-w-full">
        <KanbanBoard candidates={candidates} onUpdateCandidate={handleUpdate} loading={loading} />
      </div>
    </div>
  );
}
