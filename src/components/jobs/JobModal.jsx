import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../common/buttons/PrimaryButton';
import { SecondaryButton } from '../common/buttons/SecondaryButton';

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function JobModal({ open, initial = null, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setCompany(initial.company || '');
      setLocation(initial.location || '');
      setType(initial.type || 'Full-time');
      setSlug(initial.slug || slugify(initial.title || ''));
    } else {
      setTitle('');
      setCompany('');
      setLocation('');
      setType('Full-time');
      setSlug('');
    }
    setError('');
  }, [initial, open]);

  useEffect(() => {
    setSlug(slugify(title));
  }, [title]);

  async function checkSlugUnique(s) {
    setChecking(true);
    try {
      const res = await fetch('/api/jobs?pageSize=1000');
      const data = await res.json();
      const list = data.jobs || [];
      const exists = list.some(
        (j) => j.slug === s && (!initial || String(j.id) !== String(initial.id))
      );
      setChecking(false);
      return !exists;
    } catch {
      setChecking(false);
      return true;
    }
  }

  async function handleSave() {
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const s = slugify(slug || title);
    const unique = await checkSlugUnique(s);
    if (!unique) {
      setError('Slug already in use; please change title');
      return;
    }
    const payload = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      slug: s,
    };
    await onSave(initial ? initial.id : null, payload);
    if (onClose) onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{initial ? 'Edit Job' : 'Create Job'}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-lg p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <label className="block text-sm text-gray-500 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Frontend Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote / City"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
          </div>

          <div className="col-span-full">
            <label className="block text-sm text-gray-500 mb-1">Slug</label>
            <div className="flex items-center gap-2">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {checking && (
                <div className="w-4 h-4 border-2 border-gray-300 border-l-blue-500 rounded-full animate-spin" />
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-700 bg-red-100 px-3 py-2 rounded text-sm">{error}</div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <SecondaryButton size="small" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={handleSave} size="big">
            {initial ? 'Save' : 'Create'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
