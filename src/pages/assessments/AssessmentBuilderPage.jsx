import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton'
import { SecondaryButton } from '../../components/common/buttons/SecondaryButton'

const QUESTION_TYPES = [
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'multi-choice', label: 'Multiple Choice' },
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'file-upload', label: 'File Upload' },
]

// Helper to generate unique IDs
const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}`

export default function AssessmentBuilderPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [assessment, setAssessment] = useState({ title: '', description: '', sections: [] })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (jobId) loadAssessment()
  }, [jobId])

  const loadAssessment = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/assessments/${jobId}`)
      const data = await res.json()
      let normalized = data.assessment || { title: '', description: '', sections: [] }
      if (!Array.isArray(normalized.sections)) {
        if (Array.isArray(normalized.questions)) {
          normalized.sections = [
            { id: generateId(), title: normalized.title || 'Section', description: normalized.description || '', questions: normalized.questions }
          ]
        } else {
          normalized.sections = []
        }
      }
      setAssessment(normalized)
    } catch (err) {
      console.error('Failed to load assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  const addSection = () => {
    const newSection = { id: generateId(), title: 'New Section', description: '', questions: [] }
    setAssessment(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
  }

  const updateSection = (sectionId, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    }))
  }

  const deleteSection = (sectionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }))
  }

  const addQuestion = (sectionId) => {
    const newQuestion = { id: generateId(), type: 'short-text', label: 'New Question', required: false, options: [], validation: {}, showIf: undefined }
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s)
    }))
  }

  const updateQuestion = (sectionId, questionId, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId
        ? { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q) }
        : s
      )
    }))
  }

  const deleteQuestion = (sectionId, questionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId
        ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
        : s
      )
    }))
  }

  const addOption = (sectionId, questionId) => {
    const question = getQuestion(sectionId, questionId)
    if (!question) return
    const newOption = { id: generateId(), label: 'New Option', value: '' }
    updateQuestion(sectionId, questionId, { options: [...(question.options || []), newOption] })
  }

  const updateOption = (sectionId, questionId, optionId, updates) => {
    const question = getQuestion(sectionId, questionId)
    if (!question) return
    const updatedOptions = question.options.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt)
    updateQuestion(sectionId, questionId, { options: updatedOptions })
  }

  const deleteOption = (sectionId, questionId, optionId) => {
    const question = getQuestion(sectionId, questionId)
    if (!question) return
    updateQuestion(sectionId, questionId, { options: question.options.filter(opt => opt.id !== optionId) })
  }

  const getQuestion = (sectionId, questionId) => {
    const section = assessment.sections.find(s => s.id === sectionId)
    return section?.questions.find(q => q.id === questionId)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/assessments/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      })
      if (res.ok) {
        navigate('/assessments')
      } else throw new Error('Save failed')
    } catch (err) {
      console.error(err)
      alert('Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex gap-5 h-[80vh] mt-2">
      {/* Builder Panel */}
      <div className="flex-1 overflow-auto p-5 border border-gray-300 rounded-lg bg-white">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">Assessment Builder</h2>
          <SecondaryButton size="small" onClick={() => navigate('/assessments')}>Back</SecondaryButton>
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">Assessment Title</label>
          <input
            type="text"
            value={assessment.title}
            onChange={e => setAssessment(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter assessment title"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">Description</label>
          <textarea
            value={assessment.description}
            onChange={e => setAssessment(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter assessment description"
          />
        </div>

        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Sections</h3>
            <PrimaryButton size="small" onClick={addSection}>Add Section</PrimaryButton>
          </div>

          {assessment.sections.map(section => (
            <div key={section.id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={section.title}
                  onChange={e => updateSection(section.id, { title: e.target.value })}
                  className="font-semibold text-base border-none bg-transparent flex-1 focus:outline-none"
                  placeholder="Section title"
                />
                <SecondaryButton size="small" onClick={() => deleteSection(section.id)}>Delete</SecondaryButton>
              </div>

              <textarea
                value={section.description}
                onChange={e => updateSection(section.id, { description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Section description"
                rows={2}
              />

              <div className="mb-3">
                <PrimaryButton size="small" onClick={() => addQuestion(section.id)}>Add Question</PrimaryButton>
              </div>

              {section.questions.map(question => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  sectionId={section.id}
                  onUpdate={updateQuestion}
                  onDelete={deleteQuestion}
                  onAddOption={addOption}
                  onUpdateOption={updateOption}
                  onDeleteOption={deleteOption}
                  allQuestions={assessment.sections.flatMap(sec => sec.questions || [])}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-5 border-t border-gray-200">
          <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Assessment'}</PrimaryButton>
          <SecondaryButton onClick={() => navigate('/assessments')}>Cancel</SecondaryButton>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="flex-1 overflow-auto p-5 border border-gray-300 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-5">Live Preview</h2>
        <AssessmentPreview assessment={assessment} />
      </div>
    </div>
  )
}

// =========================
// Question Editor Component
// =========================
function QuestionEditor({ question, sectionId, onUpdate, onDelete, onAddOption, onUpdateOption, onDeleteOption }) {
  const needsOptions = ['single-choice', 'multi-choice'].includes(question.type)
  return (
    <div className="border border-gray-300 rounded-md p-3 mb-3 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <select
          value={question.type}
          onChange={e => onUpdate(sectionId, question.id, { type: e.target.value, options: needsOptions ? question.options : [] })}
          className="p-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <SecondaryButton size="small" onClick={() => onDelete(sectionId, question.id)}>Delete</SecondaryButton>
      </div>

      <input
        type="text"
        value={question.label}
        onChange={e => onUpdate(sectionId, question.id, { label: e.target.value })}
        className="w-full p-2 border border-gray-200 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Question text"
      />

      <label className="flex items-center gap-2 mb-2">
        <input type="checkbox" checked={question.required} onChange={e => onUpdate(sectionId, question.id, { required: e.target.checked })} />
        Required
      </label>

      {needsOptions && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <strong>Options:</strong>
            <PrimaryButton size="small" onClick={() => onAddOption(sectionId, question.id)}>Add Option</PrimaryButton>
          </div>
          {question.options?.map(opt => (
            <div key={opt.id} className="flex gap-2 mb-1">
              <input type="text" value={opt.label} onChange={e => onUpdateOption(sectionId, question.id, opt.id, { label: e.target.value, value: e.target.value })} className="flex-1 p-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Option label" />
              <SecondaryButton size="small" onClick={() => onDeleteOption(sectionId, question.id, opt.id)}>×</SecondaryButton>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =========================
// Live Preview Component
// =========================
function AssessmentPreview({ assessment }) {
  const [responses, setResponses] = useState({})
  const handleResponse = (id, value) => setResponses(prev => ({ ...prev, [id]: value }))

  if (!assessment.title) return <div className="text-gray-500 italic">Start building your assessment to see the preview</div>

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{assessment.title}</h3>
      {assessment.description && <p className="text-gray-500 mb-5">{assessment.description}</p>}

      {assessment.sections.map(section => (
        <div key={section.id} className="mb-8">
          <h4 className="text-md font-semibold mb-2">{section.title}</h4>
          {section.description && <p className="text-gray-500 mb-4">{section.description}</p>}

          {section.questions.map(q => (
            <div key={q.id} className="mb-5 p-4 border border-gray-300 rounded-md bg-white">
              <label className="block mb-2 font-medium">{q.label}{q.required && <span className="text-red-500"> *</span>}</label>

              {q.type === 'short-text' && <input type="text" className="w-full p-2 border border-gray-300 rounded" value={responses[q.id] || ''} onChange={e => handleResponse(q.id, e.target.value)} />}
              {q.type === 'long-text' && <textarea className="w-full p-2 border border-gray-300 rounded min-h-[80px]" value={responses[q.id] || ''} onChange={e => handleResponse(q.id, e.target.value)} />}
              {q.type === 'numeric' && <input type="number" className="w-50 p-2 border border-gray-300 rounded" value={responses[q.id] || ''} onChange={e => handleResponse(q.id, e.target.value)} min={q.validation?.min} max={q.validation?.max} />}
              {q.type === 'single-choice' && q.options?.map(opt => (
                <label key={opt.id} className="block mb-2">
                  <input type="radio" name={q.id} value={opt.value} checked={responses[q.id] === opt.value} onChange={e => handleResponse(q.id, e.target.value)} className="mr-2" />
                  {opt.label}
                </label>
              ))}
              {q.type === 'multi-choice' && q.options?.map(opt => (
                <label key={opt.id} className="block mb-2">
                  <input type="checkbox" value={opt.value} checked={(responses[q.id] || []).includes(opt.value)} onChange={e => {
                    const current = responses[q.id] || []
                    handleResponse(q.id, e.target.checked ? [...current, opt.value] : current.filter(v => v !== opt.value))
                  }} className="mr-2" />
                  {opt.label}
                </label>
              ))}
              {q.type === 'file-upload' && <input type="file" onChange={e => handleResponse(q.id, e.target.files[0]?.name || '')} className="w-full p-2 border border-gray-200 rounded" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
