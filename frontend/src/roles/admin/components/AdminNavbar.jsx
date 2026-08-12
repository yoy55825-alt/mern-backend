
import { NavLink } from 'react-router';
import './AdminNavbar.css'
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaFileExcel 
} from "react-icons/fa";
import { useContext } from 'react';
import {UserContext} from "../../../context/userContext"
import { useNavigate } from 'react-router';
import axios from 'axios';

const AdminDashboard = () => {
  const {dispatch}=useContext(UserContext)
  const navigate=useNavigate()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const handleLogout=async()=>{
    try{
      await axios.post(`${API_URL}/api/user/logout`)
      dispatch({type:"LOGOUT"})
      navigate('/')
    }catch(e){
      console.log("logout failed",e)
    }
    
  }
  return (
    <div className="admin-container">
      {/* HEADER */}
      <div className="admin-header">
        <div className="admin-brand"><img src="/webicon7.png" alt="TaskWave logo" /><div><h2>TaskWave</h2><small>Administration</small></div></div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* NAVBAR */}
      <div className="admin-navbar">
        <ul>
          <li>
            <NavLink to={'/admin/studentManagement'}>
              <FaUserGraduate /> Student Management
            </NavLink>
          </li>
          <li>
            <NavLink to={'/admin/teacherManagement'}>
              <FaChalkboardTeacher /> Teacher Management
            </NavLink>
          </li>
          <li>
            <NavLink to={'/admin/dashboard'}>
              <FaChartBar /> Statistics
            </NavLink>
          </li>
          <li>
            <NavLink to={'/admin/excelImport'}>
              <FaFileExcel />Excel spreadsheet
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
