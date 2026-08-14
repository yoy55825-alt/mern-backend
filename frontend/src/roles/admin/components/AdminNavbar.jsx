
import { NavLink } from 'react-router';
import './AdminNavbar.css'
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaFileExcel,
  FaHome,
} from "react-icons/fa";
import { useContext, useEffect, useState } from 'react';
import {UserContext} from "../../../context/userContext"
import { useNavigate } from 'react-router';
import axios from 'axios';

const AdminDashboard = () => {
  const {dispatch}=useContext(UserContext)
  const navigate=useNavigate()
  const [isMenuOpen,setIsMenuOpen]=useState(false)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(()=>{
    const closeMenu=(event)=>{
      if(event.key==='Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown',closeMenu)
    return ()=>document.removeEventListener('keydown',closeMenu)
  },[])

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
        <div className="admin-header-actions">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <button
            type="button"
            className="admin-menu-toggle"
            aria-label={isMenuOpen?'Close admin navigation':'Open admin navigation'}
            aria-expanded={isMenuOpen}
            aria-controls="admin-navigation"
            onClick={()=>setIsMenuOpen((open)=>!open)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* NAVBAR */}
      <nav id="admin-navigation" className={`admin-navbar ${isMenuOpen?'is-open':''}`} aria-label="Admin navigation">
        <ul onClick={()=>setIsMenuOpen(false)}>
          <li>
            <NavLink to={'/admin/home'}>
              <FaHome /> Home
            </NavLink>
          </li>
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
      </nav>
      {isMenuOpen&&<button className="admin-menu-backdrop" aria-label="Close admin navigation" onClick={()=>setIsMenuOpen(false)} />}
    </div>
  );
};

export default AdminDashboard;
