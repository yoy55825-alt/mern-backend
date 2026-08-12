import React from 'react'
import { Link } from 'react-router'
import { FaArrowRight, FaBookOpen } from 'react-icons/fa'

const StudentDashboard = () => {
  return (
    <div className="app-page">
      <header className="app-page-header"><div><p className="app-page-kicker">Student workspace</p><h1 className="app-page-title">Overview</h1><p className="app-page-subtitle">Everything you need to keep your coursework moving.</p></div></header>
      <section className="app-welcome">
        <div><div className="app-stat-icon"><FaBookOpen /></div><h2>Your coursework is ready</h2><p>Review current assignments, check deadlines, and continue where you left off.</p></div>
        <Link className="app-action" to="/student/assignmentList">View assignments <FaArrowRight /></Link>
      </section>
    </div>
  )
}

export default StudentDashboard
