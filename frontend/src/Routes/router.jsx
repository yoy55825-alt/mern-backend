import App from '../App.jsx';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
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
import OnlineMC from '../roles/student/component/OnlineMC.jsx';
import OnlineFb from '../roles/student/component/OnlineFb.jsx';
import SubmissionList from '../roles/teacher/pages/SubmissionList.jsx';
import GradeSubmission from '../roles/teacher/pages/GradeSubmission.jsx';
import Home from '../roles/Home.jsx';

const Router = () => {
  const { user } = useContext(UserContext);
  console.log(user?.role);


  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,

      children: [
        {
          index: true,
          element: user ? <App /> : <Login />,
        },
        {
          path: 'login',
          element: <Login />,
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
            }
          ]
        },
        {
          path: 'student',
          element: <RequiredRole allowedRole={['student']} />,
          children: [
            {
              path: 'dashboard',
              element: <StudentDashboard />
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
            },
            {
              path: 'online/mc/:assignmentId',
              element: <OnlineMC />
            },
            {
              path: 'online/fillBlank/:assignmentId',
              element: <OnlineFb />
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
          ]
        },
        {
          path: 'unauthorized',
          element: <Unauthorized />
        },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default Router;