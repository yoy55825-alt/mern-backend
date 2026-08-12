import App from '../App.jsx';
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from '../roles/admin/pages/Dashboard.jsx';
import CreateAcc from '../roles/admin/pages/CreateAcc.jsx';
import Unauthorized from '../roles/admin/components/Unauthorized.jsx'
import { useContext } from 'react';
import { UserContext } from '../context/userContext.jsx';
import RequiredRole from './requiredRoles.jsx';
import StudentDashboard from '../roles/student/pages/StudentDashboard.jsx';
import Login from '../roles/Login.jsx';
import StudentManagement from '../roles/admin/pages/StudentManagement.jsx';
import TeacherManagement from '../roles/admin/pages/TeacherManagement.jsx';
import CreateAssignment from '../roles/teacher/pages/CreateAssignment.jsx'
import AssignmentList from '../roles/teacher/pages/AssignmentList.jsx';
import ExcelImport from '../roles/admin/components/ExcelImport.jsx';
import CreateQuestion from '../roles/teacher/pages/CreateQuestion.jsx';
import StudentAssignmentList from '../roles/student/pages/AssignmentList.jsx';
import FileSubmit from '../roles/student/component/FileSubmit.jsx';
import OnlineSubmit from '../roles/student/component/OnlineSubmit.jsx';
import SubmissionList from '../roles/teacher/pages/SubmissionList.jsx';
import GradeSubmission from '../roles/teacher/pages/GradeSubmission.jsx';
import SubmissionDetail from '../roles/teacher/pages/SubmissionDetail.jsx';
import AssignmentDetailPage from '../roles/teacher/pages/AssignmentDetailPage.jsx';
import StudentLayout from '../roles/student/layout/StudentLayout.jsx';
// import HomePage from '../roles/HomePage.jsx';
const Router = () => {
  const { user, loading } = useContext(UserContext);
  console.log(user?.role);

  const homePath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'teacher'
      ? '/teacher/assignment/questionType'
      : '/student/assignmentList';

  const protectedElement = loading
    ? <div>Loading...</div>
    : user
      ? <App />
      : <Navigate to="/login" replace />;

  const loginElement = loading
    ? <div>Loading...</div>
    : user
      ? <Navigate to={homePath} replace />
      : <Login />;

  const router = createBrowserRouter([
    {
      path: '/login',
      element: loginElement,
    },
    {
      path: '/',
      element: protectedElement,
      children: [
        {
          index: true,
          element: <Navigate to={homePath} replace />,
        },
        {
          path: 'admin',
          element: <RequiredRole allowedRole={['admin']} />,
          children: [
            {
              path: 'dashboard',
              element: <Dashboard />
            },
            {
              path: 'createAcc',
              element: <CreateAcc />
            },
            {
              path: 'studentManagement',
              element: <StudentManagement />
            },
            {
              path: 'teacherManagement',
              element: <TeacherManagement />
            },
            {
              path: 'studentUpdate/:id',
              element: <CreateAcc />
            },
            {
              path: 'teacherUpdate/:id',
              element: <CreateAcc />
            },
            {
              path: 'excelImport',
              element: <ExcelImport />
            },
          ]
        },
        {
          path: 'student',
          element: <RequiredRole allowedRole={['student']} />,
          children: [
            {
              path: 'dashboard',
              element: <StudentLayout/>
            },
            {
              path: 'assignmentList',
              element: <StudentAssignmentList />
            },
            {
              path: 'fileUpload/:assignmentId',
              element: <FileSubmit />
            },
            {
              path: 'online/:assignmentId',
              element: <OnlineSubmit />
            }

          ]
        },
        {
          path: 'teacher',
          element: <RequiredRole allowedRole={['teacher']} />,
          children: [
            {
              path: 'createAssignment',
              element: <CreateAssignment />
            },
            {
              path: 'assignmentList',
              element: <AssignmentList />
            },
            {
              path: 'assignmentDetail/:id',
              element: <CreateAssignment />
            },
            {
              path: 'assignment/questionType',
              element: <CreateQuestion />
            },
            {
              path: 'submissions',
              element: <SubmissionList />
            },
            {
              path: 'submission/grade/file/:submissionId',
              element: <GradeSubmission />
            },
            {
              path: "submission/detail/:id",
              element: <SubmissionDetail />
            },
            {
              path: "assignment/detail/:id",
              element: <AssignmentDetailPage />
            },
          ]
        },
        {
          path: 'unauthorized',
          element: <Unauthorized />
        },
      ]
    },
    {
      path: '*',
      element: <Navigate to={user ? homePath : '/login'} replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
