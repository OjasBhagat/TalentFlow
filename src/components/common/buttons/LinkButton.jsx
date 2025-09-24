import React from 'react'
import { useLocation } from 'react-router-dom'

export const LinkButton = ({ children, to, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)

  return (
    <div
      className={`
        flex justify-center px-3 py-2 cursor-pointer font-light text-sm rounded
        ${isActive ? 'bg-amber-500 text-white shadow rounded-full' : 'hover:bg-slate-100 text-gray-800'}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
