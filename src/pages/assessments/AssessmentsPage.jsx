import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton'
import { SecondaryButton } from '../../components/common/buttons/SecondaryButton'

export default function AssessmentsPage({ jobs }) {
  const navigate = useNavigate()

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
