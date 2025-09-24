import React, { useEffect, useState } from 'react';
import JobList from '../../components/jobs/JobList';
import JobModal from '../../components/jobs/JobModal';
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton';

export default function JobsPage({ onNavigate, search: searchProp = '', type: typeProp = 'All', jobs: jobsProp = null }) {
  const [jobs, setJobs] = useState(jobsProp || []);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [viewFilter, setViewFilter] = useState('All');
  const [search, setSearch] = useState(searchProp);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: search, type: typeProp });
      if (viewFilter === 'Archived' || viewFilter === 'Filled') {
        params.set('page', '1');
        params.set('pageSize', '1000');
      } else {
        params.set('status', 'active');
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
      }

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      let list = (data.jobs || []).filter(Boolean);

      if (typeProp && typeProp !== 'All') {
        const t = String(typeProp).toLowerCase();
        list = list.filter((j) => String(j.type || 'Full-time').toLowerCase() === t);
      }

      if (search && String(search).trim()) {
        const q = String(search).toLowerCase();
        list = list.filter(
          (j) =>
            (j.title || '').toLowerCase().includes(q) ||
            (j.slug || '').toLowerCase().includes(q) ||
            (j.company || '').toLowerCase().includes(q)
        );
      }

      if (viewFilter === 'Archived') {
        list = list.filter((j) => j.archived === true || String(j.status || '').toLowerCase() === 'archived');
      } else if (viewFilter === 'Filled') {
        list = list.filter((j) => String(j.status || '').toLowerCase() === 'filled' && !(j.archived === true));
      }

      setTotal(list.length);
      const start = (page - 1) * pageSize;
      setJobs(list.slice(start, start + pageSize));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // useEffect(() => {
  //   if (!jobsProp) load();
  //   else {
  //     setJobs(jobsProp);
  //     setLoading(false);
  //   }
  // }, [jobsProp, search, page, typeProp, viewFilter]);
  useEffect(() => {
  if (!jobsProp || (Array.isArray(jobsProp) && jobsProp.length === 0)) {
    load()
  } else {
    setJobs(jobsProp)
    setLoading(false)
  }
}, [jobsProp, search, page, typeProp, viewFilter])

  async function createOrUpdate(id, payload) {
    if (!id) {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setJobs((s) => [ ...(s || []), data.job ]);
    } else {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setJobs((s) => s.map((j) => (String(j.id) === String(id) ? data.job : j)));
    }
  }

  async function handleDelete(id) {
    const prev = jobs;
    setJobs((s) => s.filter((j) => String(j.id) !== String(id)));
    setPendingIds((p) => new Set(p).add(String(id)));
    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    } catch (err) {
      setJobs(prev);
    } finally {
      setPendingIds((p) => { const ns = new Set(p); ns.delete(String(id)); return ns; });
    }
  }

  async function handleUpdate(id, updates) {
    const prev = jobs;
    setJobs((s) => s.map((j) => (String(j.id) === String(id) ? { ...j, ...updates } : j)));
    setPendingIds((p) => new Set(p).add(String(id)));
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setJobs((s) => s.map((j) => (String(j.id) === String(id) ? data.job : j)));
    } catch (err) {
      setJobs(prev);
    } finally {
      setPendingIds((p) => { const ns = new Set(p); ns.delete(String(id)); return ns; });
    }
  }

  async function handleReorder(order) {
    const map = new Map((jobs || []).map((j) => [String(j.id), j]));
    const reordered = order.map((id) => map.get(String(id))).filter(Boolean);
    setJobs(reordered);
    try {
      const res = await fetch('/api/jobs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });
      if (!res.ok) throw new Error('reorder failed');
      const data = await res.json();
      setJobs(data.jobs || reordered);
    } catch (err) {
      await load();
    }
  }

  const visibleJobs = jobs.filter((j) => {
    if (viewFilter === 'All') return !(j.archived === true);
    if (viewFilter === 'Archived') return j.archived === true;
    if (viewFilter === 'Filled') return String(j.status || '').toLowerCase() === 'filled';
    return true;
  });

  return (
    <div className="p-4 relative">
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white/70 z-50">
          <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 bg-white/75 border border-gray-200 rounded-xl p-2 backdrop-blur-sm">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full py-2.5 px-3 border border-black rounded-full bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm">
            View:
            <select
              className="ml-1.5 py-2.5 px-3 border border-gray-200 rounded-lg bg-white text-slate-900"
              value={viewFilter}
              onChange={(e) => { setViewFilter(e.target.value); setPage(1); }}
            >
              <option>All</option>
              <option>Archived</option>
              <option>Filled</option>
            </select>
          </label>
          <div className="px-2 py-1 rounded-full border border-gray-200 bg-gray-100 text-gray-700 text-xs">{total} total</div>
          <PrimaryButton onClick={() => { setModalOpen(true); setEditing(null); }}>+ Create Job</PrimaryButton>
        </div>
      </div>

      <JobList
        jobs={visibleJobs}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onArchive={async (id, archived) => { await handleUpdate(id, { archived }) }}
        onReorder={handleReorder}
        onNavigate={onNavigate}
        loading={loading}
        pendingIds={pendingIds}
      />

      <div className="flex gap-2 items-center mt-2">
        <button
          className="py-1.5 px-2.5 border border-gray-200 rounded-lg bg-white text-slate-900 disabled:opacity-55 disabled:cursor-not-allowed"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >Prev</button>
        <span className="text-gray-500">Page {page} / {Math.ceil((total || 0) / pageSize) || 1}</span>
        <button
          className="py-1.5 px-2.5 border border-gray-200 rounded-lg bg-white text-slate-900 disabled:opacity-55 disabled:cursor-not-allowed"
          disabled={page >= Math.ceil((total || 0) / pageSize)}
          onClick={() => setPage((p) => p + 1)}
        >Next</button>
      </div>

      <JobModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={createOrUpdate} />
    </div>
  );
}
