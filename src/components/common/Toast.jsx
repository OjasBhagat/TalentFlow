import React, { useEffect } from 'react'

export default function Toast({ toasts = [], onRemove }) {
  // Local sweeper: periodically remove expired toasts so parent App doesn't need to re-render on a timer
  useEffect(() => {
    if (!toasts || toasts.length === 0) return
    const iv = setInterval(() => {
      const now = Date.now()
      toasts.forEach((t) => {
        if (t.expiresAt && t.expiresAt <= now) {
          onRemove && onRemove(t.id)
        }
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [toasts, onRemove])

  return (
    <div className="fixed right-4 top-4 z-50">
      {toasts.map((t) => (
        <div key={t.id} className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg shadow-gray-900/5 mb-2">
          <div className="text-sm text-gray-900">{t.message}</div>
          <div className="mt-1.5 text-right">
            <button onClick={() => onRemove(t.id)} className="bg-transparent border-none text-gray-500 cursor-pointer text-sm hover:text-gray-700">Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  )
}
