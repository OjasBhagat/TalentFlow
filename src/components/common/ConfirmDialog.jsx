import React from 'react'

export default function ConfirmDialog({ open, title = 'Confirm', message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-96 shadow-2xl shadow-gray-900/10">
        <h3 className="mt-0">{title}</h3>
        <div className="mb-3">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="appearance-none border border-gray-200 bg-white text-gray-900 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out hover:shadow-sm disabled:opacity-55 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={onConfirm} className="bg-blue-600 text-white border-none px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  )
}
