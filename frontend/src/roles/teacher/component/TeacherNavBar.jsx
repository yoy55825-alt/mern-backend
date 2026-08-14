
import { NavLink } from 'react-router';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaChartBar,
  FaFileExcel,
  FaSignOutAlt,
  FaBars,
  FaHome
} from "react-icons/fa";
import { IoIosCreate } from "react-icons/io";
import { CiViewList } from "react-icons/ci";
import { MdAssignment } from "react-icons/md";
import React from 'react';
import { useContext, useState } from 'react';
import { UserContext } from "../../../context/userContext"
import { useNavigate } from 'react-router';
import axios from 'axios';
import './TeacherNavBar.css'
const AdminDashboard = () => {
  const { dispatch } = useContext(UserContext)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
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
        <NavLink to={'/teacher/home'} onClick={() => setOpen(false)}>
          <FaHome /> Home
        </NavLink>
        <NavLink to={'/teacher/assignmentList'} onClick={() => setOpen(false)}>
          <CiViewList /> Assignment list
        </NavLink>
        <NavLink to={'/teacher/assignment/questionType'} onClick={() => setOpen(false)}>
          <IoIosCreate /> Create Assignment
        </NavLink>
        <NavLink to={'/teacher/submissions'} onClick={() => setOpen(false)}>
          <MdAssignment /> Submissions
        </NavLink>
        
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
