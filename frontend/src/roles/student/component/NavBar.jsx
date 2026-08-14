import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FaClipboardList, FaHome, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './NavBar.css';
import { UserContext } from '../../../context/userContext';

const Navbar = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { dispatch } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const navLinks = [
    { to: '/student/home', label: 'Home', icon: <FaHome /> },
    { to: '/student/dashboard', label: 'Overview', icon: <FaClipboardList /> },
    { to: '/student/assignmentList', label: 'Assignments', icon: <FaClipboardList /> },
  ];

  const handleLogout = async () => {
    try { await axios.post(`${API_URL}/api/user/logout`); } finally {
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="portal-nav">
      <div className="portal-nav-inner">

          {/* Logo */}
          <NavLink to="/student/home" className="portal-brand">
            <img src="/webicon7.png" alt="TaskWave logo" />
            <strong>TaskWave</strong>
          </NavLink>

          {/* Desktop nav links */}
          <div className={`portal-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side: user info */}
          <div className="portal-user">
            {user && (
              <div className="portal-user-copy">
                <strong>{user.name}</strong>
                <span>
                  Year {user.year} · {user.major}
                </span>
              </div>
            )}
            <div className="portal-avatar">
              {getInitials(user?.name)}
            </div>

            {/* Mobile hamburger */}
            <button className="portal-logout" onClick={handleLogout} aria-label="Log out"><FaSignOutAlt /></button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="portal-menu"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
