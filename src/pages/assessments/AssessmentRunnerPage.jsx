import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton'
import { SecondaryButton } from '../../components/common/buttons/SecondaryButton'

// --- hook to compute conditional visibility ---
function useVisibleQuestions(assessment, responses) {
  const visibleMap = useMemo(() => {
    const map = new Map()
    for (const section of assessment?.sections || []) {
      for (const q of section.questions || []) {
        const showIf = q?.showIf?.questionId
          ? { questionId: q.showIf.questionId, equals: q.showIf.equals }
          : (q?.condition?.if?.questionId
              ? { questionId: q.condition.if.questionId, equals: q.condition.if.equals }
              : null)

        if (!showIf?.questionId) {
          map.set(q.id, true)
          continue
        }

        const target = responses[showIf.questionId]
        const eqRaw = showIf.equals

        if (Array.isArray(target)) {
          if (!eqRaw) {
            map.set(q.id, target.length > 0)
          } else {
            const list = String(eqRaw).split(',').map(s => s.trim()).filter(Boolean)
            map.set(q.id, list.some(v => target.includes(v)))
          }
          continue
        }

        if (!eqRaw) {
          map.set(q.id, Boolean(target))
          continue
        }

        const list = String(eqRaw).split(',').map(s => s.trim()).filter(Boolean)
        const t = String(target ?? '')
        map.set(q.id, list.includes(t))
      }
    }
    return map
  }, [assessment, responses])
  return visibleMap
}

export default function AssessmentRunnerPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState(null)
  const [responses, setResponses] = useState({})
  const [errors, setErrors] = useState({})
  const [submitResult, setSubmitResult] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/assessments/${jobId}`)
        const data = await res.json()
        if (!mounted) return
        setAssessment(data.assessment || { title: 'Assessment', sections: [] })
      } catch {
        if (!mounted) return
        setAssessment({ title: 'Assessment', sections: [] })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [jobId])

  const visibleMap = useVisibleQuestions(assessment, responses)

  function setAnswer(id, value) {
    setResponses(s => ({ ...s, [id]: value }))
    setErrors(e => ({ ...e, [id]: undefined }))
  }

  function validate() {
    const errs = {}
    for (const section of assessment?.sections || []) {
      for (const q of section.questions || []) {
        if (!visibleMap.get(q.id)) continue
        const val = responses[q.id]
        if (q.required) {
          if (q.type === 'multi-choice') {
            if (!Array.isArray(val) || val.length === 0) errs[q.id] = 'This question is required'
          } else if (val === undefined || val === null || String(val).trim() === '') {
            errs[q.id] = 'This question is required'
          }
        }
        if (q.type === 'numeric' && val !== undefined && val !== '') {
          const num = Number(val)
          if (Number.isNaN(num)) errs[q.id] = 'Must be a number'
          if (q.validation?.min !== undefined && num < q.validation.min) errs[q.id] = `Min ${q.validation.min}`
          if (q.validation?.max !== undefined && num > q.validation.max) errs[q.id] = `Max ${q.validation.max}`
        }
        if ((q.type === 'short-text' || q.type === 'long-text') && q.validation?.maxLength && val) {
          if (String(val).length > q.validation.maxLength) errs[q.id] = `Max length ${q.validation.maxLength}`
        }
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e && e.preventDefault()
    if (!validate()) return
    // Static submission: just show modal
    setSubmitResult(true)
  }

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
    </div>
  )

  if (!assessment?.sections?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="font-semibold mb-1">No assessment configured</div>
        <div className="text-gray-500">
          Use the Builder to add sections and questions.
        </div>
      </div>
    )
  }

  return (
    <>
      <form className="grid grid-cols-1 gap-4  mt-2">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{assessment.title || 'Assessment'}</h3>
            <SecondaryButton size="small" onClick={() => navigate('/assessments')}>
              Back
            </SecondaryButton>
          </div>
          {assessment.description && <p className="text-gray-500">{assessment.description}</p>}

          {(assessment.sections || []).map((section) => (
            <div key={section.id} className="mt-6">
              <h4 className="font-semibold mb-2">{section.title}</h4>
              {section.description && <div className="text-gray-500 mb-3">{section.description}</div>}
              <div className="grid gap-4">
                {(section.questions || []).map((q) =>
                  visibleMap.get(q.id) ? (
                    <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <label className="block mb-2 font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>

                      {q.type === 'short-text' && (
                        <input
                          className="py-2.5 px-3 border border-gray-200 rounded-lg w-full"
                          type="text"
                          value={responses[q.id] || ''}
                          onChange={(e) => setAnswer(q.id, e.target.value)}
                          maxLength={q.validation?.maxLength}
                        />
                      )}

                      {q.type === 'long-text' && (
                        <textarea
                          className="py-2.5 px-3 border border-gray-200 rounded-lg w-full min-h-[100px]"
                          value={responses[q.id] || ''}
                          onChange={(e) => setAnswer(q.id, e.target.value)}
                          maxLength={q.validation?.maxLength}
                        />
                      )}

                      {q.type === 'numeric' && (
                        <input
                          className="py-2.5 px-3 border border-gray-200 rounded-lg w-full"
                          type="number"
                          value={responses[q.id] || ''}
                          onChange={(e) => setAnswer(q.id, e.target.value)}
                          min={q.validation?.min}
                          max={q.validation?.max}
                        />
                      )}

                      {q.type === 'single-choice' && (q.options || []).map((opt) => (
                        <label key={opt.id} className="block mb-1.5">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.value}
                            checked={responses[q.id] === opt.value}
                            onChange={(e) => setAnswer(q.id, e.target.value)}
                            className="mr-2"
                          />
                          {opt.label}
                        </label>
                      ))}

                      {q.type === 'multi-choice' && (q.options || []).map((opt) => {
                        const arr = Array.isArray(responses[q.id]) ? responses[q.id] : []
                        const checked = arr.includes(opt.value)
                        return (
                          <label key={opt.id} className="block mb-1.5">
                            <input
                              type="checkbox"
                              value={opt.value}
                              checked={checked}
                              onChange={(e) => {
                                const curr = Array.isArray(responses[q.id]) ? responses[q.id] : []
                                const next = e.target.checked ? [...curr, opt.value] : curr.filter((v) => v !== opt.value)
                                setAnswer(q.id, next)
                              }}
                              className="mr-2"
                            />
                            {opt.label}
                          </label>
                        )
                      })}

                      {q.type === 'file-upload' && (
                        <input
                          className="py-2.5 px-3 border border-gray-200 rounded-lg w-full"
                          type="file"
                          onChange={(e) => setAnswer(q.id, e.target.files?.[0]?.name || '')}
                        />
                      )}

                      {errors[q.id] && (
                        <div className="inline-block text-xs py-1 px-2 rounded-full bg-red-100 text-red-700 border border-red-200 mt-2">
                          {errors[q.id]}
                        </div>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-6">
            <PrimaryButton size="small" onClick={handleSubmit}>
              Submit
            </PrimaryButton>
            <SecondaryButton size="small" onClick={() => navigate('/assessments')}>
              Cancel
            </SecondaryButton>
          </div>
        </div>
      </form>

      {submitResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">Assessment Submitted</h3>
            <p className="text-gray-500 mb-6">Your assessment has been successfully submitted.</p>
            <PrimaryButton size="small" onClick={() => navigate('/assessments')}>
              Go Back
            </PrimaryButton>
          </div>
        </div>
      )}
    </>
  )
}
