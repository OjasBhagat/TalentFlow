import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CANDIDATE_STAGES } from '../../lib/storage';

export default function KanbanBoard({ candidates = [], onUpdateCandidate, loading = false }) {
  const [activeId, setActiveId] = useState(null);
  const [draggedCandidate, setDraggedCandidate] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const candidatesByStage = useMemo(() => {
    const acc = {};
    const safe = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
    for (const stage of CANDIDATE_STAGES) {
      acc[stage] = safe.filter(candidate => (candidate.stage || 'Applied') === stage);
    }
    return acc;
  }, [candidates]);

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    setDraggedCandidate(candidates.find(c => String(c.id) === String(active.id)));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    setDraggedCandidate(null);
    if (!over) return;

    const activeCandidate = candidates.find(c => String(c.id) === String(active.id));
    if (!activeCandidate) return;

    let targetStage = null;
    if (CANDIDATE_STAGES.includes(over.id)) {
      targetStage = over.id;
    } else {
      const targetCandidate = candidates.find(c => String(c.id) === String(over.id));
      if (targetCandidate) targetStage = targetCandidate.stage || 'Applied';
    }

    if (targetStage && targetStage !== (activeCandidate.stage || 'Applied')) {
      onUpdateCandidate(activeCandidate.id, { stage: targetStage });
    }
  };

  if (loading) return (
  <div className="flex justify-center items-center p-8">
    <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
  </div>
);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex gap-4 w-max min-w-full">
        {CANDIDATE_STAGES.map(stage => (
          <KanbanColumn key={stage} stage={stage} candidates={candidatesByStage[stage]} activeId={activeId} />
        ))}
      </div>

      <DragOverlay>
        {activeId && draggedCandidate && <CandidateCard candidate={draggedCandidate} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}

const KanbanColumn = React.memo(({ stage, candidates, activeId }) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const getStageColor = (s) => ({
    'Applied': '#fef3c7',       // light yellow
    'Phone Screen': '#dbeafe',  // light blue
    'Onsite': '#e0f2fe',        // sky blue
    'Offer': '#d1fae5',         // mint green
    'Hired': '#a7f3d0',         // soft green
    'Rejected': '#fee2e2'       // soft red
  })[s] || '#f0f0f0';

  return (
    <div
      ref={setNodeRef}
      className="w-[280px] rounded-xl p-4 border-2 border-dashed border-transparent shadow-lg flex-shrink-0"
      style={{ background: isOver ? '#bfdbfe' : getStageColor(stage), transition: 'all 0.2s ease' }}
    >
      <div className="mb-4 p-4 bg-gray-200 rounded-xl shadow-inner border border-gray-200">
        <h3 className="text-base font-bold text-gray-800">{stage}</h3>
        <div className="text-sm text-gray-600 mt-1 font-medium">
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
        </div>
      </div>

      <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {candidates.map(c => <CandidateCard key={c.id} candidate={c} isActive={activeId === c.id} />)}
        </div>
      </SortableContext>

      {candidates.length === 0 && (
        <div className="p-6 text-center text-gray-500 text-sm italic border-2 border-dashed border-gray-300 rounded-xl bg-white/70">
          Drop candidates here
        </div>
      )}
    </div>
  );
});

const CandidateCard = React.memo(({ candidate, isActive = false, isDragging = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: candidate.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const getStatusColor = (stage) => ({
    'Applied': '#f59e0b',       // amber
    'Phone Screen': '#3b82f6',  // blue
    'Onsite': '#0ea5e9',        // sky
    'Offer': '#10b981',         // green
    'Hired': '#059669',         // dark green
    'Rejected': '#ef4444'       // red
  })[stage] || '#6b7280';
  return (
    <div
      ref={setNodeRef}
      className={`p-3 bg-white rounded-lg border cursor-grab transition-all duration-200 ${isActive ? 'border-blue-400 shadow-xl ring-2 ring-blue-200' : 'border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1'
        } ${isDragging ? 'opacity-90' : 'opacity-100'}`}
      style={{ ...style, transform: isDragging ? 'rotate(3deg) scale(1.05)' : style.transform }}
      {...attributes}
      {...listeners}
    >
      <div className='flex justify-between mb-2'>
        <div className="mb-2">
          <div className="font-semibold text-sm text-gray-800">{candidate.name}</div>
          <div className="text-xs text-gray-600 mt-1">{candidate.email}</div>
        </div>

        {candidate.jobId && (
          <div className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded flex items-center">
            Job: {candidate.jobId}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-700 flex items-center gap-1 font-medium">
          <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: getStatusColor(candidate.stage || 'Applied') }} />
          {candidate.stage || 'Applied'}
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">#{String(candidate.id).slice(-4)}</div>
      </div>
    </div>
  );
});
