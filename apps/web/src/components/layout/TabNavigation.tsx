import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart3 } from 'lucide-react'

export const TabNavigation: React.FC = () => {
  return (
    <div className="tab-navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/analytics"
        className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
      >
        <BarChart3 size={16} />
        <span>Analytics</span>
      </NavLink>
    </div>
  )
}

