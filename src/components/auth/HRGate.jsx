import React from 'react'
import { Navigate } from 'react-router-dom'

const HRGate = ({ children }) => {
  let ok = false
  try {
    const raw = localStorage.getItem('hr_session')
    if (raw) {
      const s = JSON.parse(raw)
      ok = !!s?.ok
    }
  } catch {}
  if (!ok) return <Navigate to="/login" replace />
  return children
}

export default HRGate