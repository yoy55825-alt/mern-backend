import axios from 'axios'
import React, { useEffect, useState } from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getCount = async () => {
    try {
      setLoading(true)
      console.log('Fetching from:', `${API_URL}/api/index`)
      const res = await axios.get(`${API_URL}/api/index`,{
        withCredentials : true
      })
      // console.log('Response data:', res.data)

      // Check the structure of your response
      let users = []
      if (Array.isArray(res.data)) {
        users = res.data
      } else if (res.data.users && Array.isArray(res.data.users)) {
        users = res.data.users
      } else if (res.data.data && Array.isArray(res.data.data)) {
        users = res.data.data
      } else {
        // console.error('Unexpected response structure:', res.data)
        setError('Invalid data format received from server')
        return
      }

      // Count students and teachers based on role
      const studentsCount = users.filter(user => user.role === 'student').length
      const teachersCount = users.filter(user => user.role === 'teacher').length

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalUsers: users.length
      })

      setError(null)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCount()
  }, [])

  if (loading) {
    return <div className="dashboard-container">Loading...</div>
  }

  if (error) {
    return <div className="dashboard-container">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-md max-w-3xl w-full p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200 p-6 rounded-lg text-center shadow-sm">
            <h4 className="text-lg font-medium text-gray-700">Total Students</h4>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-lg text-center shadow-sm">
            <h4 className="text-lg font-medium text-gray-700">Total Teachers</h4>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTeachers}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-lg text-center shadow-sm">
            <h4 className="text-lg font-medium text-gray-700">Total Users</h4>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard