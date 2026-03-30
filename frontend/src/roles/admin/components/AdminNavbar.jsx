
import { Link } from 'react-router';
import './AdminNavbar.css'
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
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
  const handleLogout=async()=>{
    try{
      await axios.post('http://localhost:3000/api/user/logout')
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
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* NAVBAR */}
      <div className="admin-navbar">
        <ul>
          <li>
            <Link to={'/admin/studentManagement'}>
              <FaUserGraduate /> Student Management
            </Link>
          </li>
          <li>
            <Link to={'/admin/teacherManagement'}>
              <FaChalkboardTeacher /> Teacher Management
            </Link>
          </li>
          <li>
            <Link to={'admin/dashboard'}>
              <FaChartBar /> Statistics
            </Link>
          </li>
          <li>
            <Link to={'/admin/excelImport'}>
              <FaFileExcel />Excel spreadsheet
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
