import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from './roles/admin/components/AdminNavbar'
import TeacherNavBar from './roles/teacher/component/TeacherNavBar'

const App = () => {
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')
  const isTeacherRoute = location.pathname.startsWith('/teacher')

  // For admin routes, AdminNavbar already contains its own main/outlet structure
  // For teacher routes, we need to wrap with main tag
  // For other routes, just render outlet

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  if (isTeacherRoute) {
    return (
      <div className="min-h-screen bg-gray-100">
        <TeacherNavBar />
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  // Default layout for non-admin/teacher routes
  return (
    <div className="min-h-screen bg-gray-100">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App