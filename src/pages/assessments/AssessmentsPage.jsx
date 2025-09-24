import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton'
import { SecondaryButton } from '../../components/common/buttons/SecondaryButton'

export default function AssessmentsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
   const fetchJobs = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/jobs')
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch (err) {
        console.error('Failed to fetch jobs', err)
      } finally {
        setLoading(false)
      }
    }
  
    useEffect(() => { fetchJobs() }, [])
    if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
    </div>
  )
  return (
    <div className="p-4">
      <p className="text-gray-500 mb-4">
        Select a job to build or edit its assessment.
      </p>

      <div className="flex flex-col gap-3">
        {jobs.map((j) => (
          <div
            key={j.id}
            className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            {/* Left side: job info */}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{j.title}</span>
              <span className="text-xs text-gray-500">ID: {j.id}</span>
            </div>

            {/* Right side: actions */}
            <div className="flex gap-2">
              <PrimaryButton
                size="small"
                onClick={() => navigate(`/assessments/${j.id}`)}
              >
                Open Builder
              </PrimaryButton>
              <SecondaryButton
                size="small"
                onClick={() => navigate(`/assessments/${j.id}/run`)}
              >
                Run
              </SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
