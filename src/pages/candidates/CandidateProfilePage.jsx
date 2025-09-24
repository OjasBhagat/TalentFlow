import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sendInviteEmail } from '../../lib/email';
import { CANDIDATE_STAGES } from '../../lib/storage';
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/common/buttons/SecondaryButton';

export default function CandidateProfilePage({ addToast }) {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const initRef = useRef({});

  useEffect(() => {
    if (candidateId) loadCandidateData();
  }, [candidateId]);

  const loadCandidateData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}`);
      if (!res.ok) throw new Error('Candidate not found');
      const data = await res.json();
      setCandidate(data.candidate);

      const timelineRes = await fetch(`/api/candidates/${candidateId}/timeline`);
      const timelineData = await timelineRes.json();
      setTimeline(timelineData.timeline || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (newStage) => {
    if (!candidate) return;
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) loadCandidateData();
    } catch (err) {
      console.error(err);
    }
  };

  const inviteCandidate = async () => {
    if (!candidate?.email) {
      addToast && addToast('Candidate email missing');
      return;
    }
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, email: candidate.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast && addToast(data?.error || 'Failed to invite');
        return;
      }
      await sendInviteEmail({
        toEmail: candidate.email,
        candidateName: candidate.name,
        tempPassword: data.password,
      });
      addToast && addToast(`Invite sent to ${candidate.email}`);
    } catch (err) {
      addToast && addToast('Failed to invite candidate');
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !candidate) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: (candidate.notes || '') + '\n' + newNote.trim(),
        }),
      });
      if (res.ok) {
        setNewNote('');
        loadCandidateData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!candidate)
    return (
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">Candidate Not Found</h2>
        <SecondaryButton size="small" onClick={() => navigate('/candidates')}>
          Back to Candidates
        </SecondaryButton>
      </div>
    );

  return (
    <div className="p-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">{candidate.name}</h1>
            <div className="text-gray-500 mb-1">{candidate.email}</div>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getStatusColor(candidate.stage) }}
              />
              <span className="font-medium">Current Stage: {candidate.stage}</span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={candidate.stage || CANDIDATE_STAGES[0]}
              onChange={(e) => updateStage(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md"
            >
              {CANDIDATE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            <PrimaryButton onClick={inviteCandidate}>Invite (send password)</PrimaryButton>

            {/* Back Button */}
            <SecondaryButton onClick={() => navigate(-1)}>Back</SecondaryButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Main Content */}
        <div className="space-y-5">
          {/* Candidate Info */}
          <div className="bg-white border border-gray-300 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-2">Candidate Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Full Name" value={candidate.name} />
              <Field label="Email" value={candidate.email} />
              <Field label="Job ID" value={candidate.jobId || 'Not specified'} />
              <Field label="Candidate ID" value={candidate.id} />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-300 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add note... Use @mentions"
              className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md mb-2"
            />
            <div className="flex justify-end">
              <PrimaryButton onClick={addNote} disabled={!newNote.trim() || addingNote}>
                {addingNote ? 'Adding...' : 'Add Note'}
              </PrimaryButton>
            </div>

            {candidate.notes ? (
              <div className="mt-2 whitespace-pre-wrap">
                {candidate.notes.split('\n').map((line, idx) => (
                  <div key={idx} className="mb-1">
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 italic text-gray-500">No notes yet.</div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="bg-white border border-gray-300 rounded-xl p-4 space-y-2">
            <h3 className="text-lg font-semibold mb-2">Timeline</h3>
            {timeline.length === 0 ? (
              <div className="text-gray-500 italic">No timeline events</div>
            ) : (
              timeline.map((event, idx) => <TimelineEvent key={idx} event={event} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Field Component ---
function Field({ label, value }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="p-2 border border-gray-300 rounded-md bg-white">{value}</div>
    </div>
  );
}

// --- Timeline Event ---
function TimelineEvent({ event }) {
  const icons = { created: '👤', stage: '🔄', note: '📝', seed: '🌱', submission: '📄' };
  const desc = event.note || '';
  return (
    <div className="flex gap-2 p-2 border border-gray-300 rounded-md bg-white">
      <div>{icons[event.type] || '📅'}</div>
      <div>
        <div>{desc}</div>
        <div className="text-gray-500 text-xs">{new Date(event.at).toLocaleString()}</div>
      </div>
    </div>
  );
}

// --- Stage status color ---
function getStatusColor(stage) {
  const colors = {
    Applied: '#6b7280',
    'Phone Screen': '#f59e0b',
    Onsite: '#3b82f6',
    Offer: '#10b981',
    Hired: '#059669',
    Rejected: '#ef4444',
  };
  return colors[stage] || '#6b7280';
}
