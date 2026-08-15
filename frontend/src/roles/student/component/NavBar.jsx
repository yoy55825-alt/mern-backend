import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FaBars, FaClipboardList, FaHome, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import { UserContext } from '../../../context/userContext';
import './NavBar.css';

const Navbar = () => {
  const { dispatch } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const navLinks = [
    { to: '/student/home', label: 'Home', icon: <FaHome /> },
    { to: '/student/dashboard', label: 'Overview', icon: <FaClipboardList /> },
    { to: '/student/assignmentList', label: 'Assignments', icon: <FaClipboardList /> },
  ];

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/user/logout`);
    } finally {
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    }
  };

  return (
    <nav className="portal-nav">
      <div className="portal-nav-inner">
        <NavLink to="/student/home" className="portal-brand" onClick={() => setMenuOpen(false)}>
          <img src="/webicon7.png" alt="TaskWave logo" />
          <strong>TaskWave</strong>
        </NavLink>

        <div id="student-navigation" className={`portal-links ${menuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
              {link.icon}
              {link.label}
            </NavLink>
          ))}
          <button type="button" onClick={handleLogout} className="portal-logout">
            <FaSignOutAlt /> Logout
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="portal-menu"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="student-navigation"
        >
          <FaBars />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
