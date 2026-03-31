
import { Link } from 'react-router';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaChartBar,
  FaFileExcel
} from "react-icons/fa";
import { useContext } from 'react';
import { UserContext } from "../../../context/userContext"
import { useNavigate } from 'react-router';
import axios from 'axios';

const AdminDashboard = () => {
  const { dispatch } = useContext(UserContext)
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/user/logout`)
      dispatch({ type: "LOGOUT" })
      navigate('/')
    } catch (e) {
      console.log("logout failed", e)
    }

  }
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('menu-open');
      document.querySelector('.navbar').classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
      document.querySelector('.navbar')?.classList.remove('menu-open');
    }
  }, [open]);
  return (
    <nav className="navbar">
       {/* LEFT SIDE */}
      <div className="nav-left">
        <div className="logo">
          <img src="/webicon7.png" alt="logo" />
          <h1>TaskWave</h1>
        </div>
      </div>

      {/* NAVBAR */}
      <div className={`nav-right ${open ? "active" : ""}`}>
        <Link to={'/teacher/assignmentList'}>
          <FaUserGraduate /> Assignment list
        </Link>
        <Link to={'/teacher/assignment/questionType'}>
          <FaChalkboardTeacher /> Create Assignment
        </Link>
        <Link to={'/teacher/submissions'}>
          <FaChartBar /> submissions
        </Link>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
      <div className="menu-icon" onClick={() => setOpen(!open)}>
        <FaBars />
      </div>
    </nav>
  );
};

export default AdminDashboard;
