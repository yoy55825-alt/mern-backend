import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaChartBar,
} from "react-icons/fa";
import './Dashboard.css'
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalUsers: 0
  })
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const getCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/index`)
      const users = res.data
      
      // Count students and teachers based on role
      const studentsCount = users.filter(user => user.role === 'student').length
      const teachersCount = users.filter(user => user.role === 'teacher').length
      
      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalUsers: users.length
      })
      
      
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  
  useEffect(() => {
    getCount()
  }, [])
  
  return (
    <div className="dashboard-container">
      <div className="box stats-box">

        <div className="stats">
          <div className="stat-card">
            <h4>Total Students</h4>
            <p>{stats.totalStudents}</p>
          </div>

          <div className="stat-card">
            <h4>Total Teachers</h4>
            <p>{stats.totalTeachers}</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard