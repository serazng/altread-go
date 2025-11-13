import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart3 } from 'lucide-react'

export const TabNavigation: React.FC = () => {
  return (
    <div className="flex gap-0.5 bg-surface-secondary p-0.5 rounded-md w-fit mb-12">
      <NavLink
        to="/"
        className={({ isActive }) => `flex items-center gap-1.5 px-3 py-2 border-none bg-transparent text-content-secondary text-[13px] font-medium rounded-[4px] cursor-pointer transition-all duration-150 hover:text-content-primary hover:bg-surface-hover ${isActive ? 'bg-surface-primary text-content-primary' : ''}`}
      >
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/analytics"
        className={({ isActive }) => `flex items-center gap-1.5 px-3 py-2 border-none bg-transparent text-content-secondary text-[13px] font-medium rounded-[4px] cursor-pointer transition-all duration-150 hover:text-content-primary hover:bg-surface-hover ${isActive ? 'bg-surface-primary text-content-primary' : ''}`}
      >
        <BarChart3 size={16} />
        <span>Analytics</span>
      </NavLink>
    </div>
  )
}

