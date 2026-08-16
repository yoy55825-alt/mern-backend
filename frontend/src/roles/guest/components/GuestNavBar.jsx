import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Home, LogIn, Menu, X } from 'lucide-react';
import './GuestNavBar.css';

const GuestNavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="guest-nav">
      <Link className="guest-brand" to="/guest/welcome" onClick={() => setOpen(false)}>
        <img src="/webicon7.png" alt="TaskWave logo" />
        <div><strong>TaskWave</strong><small>Guest preview</small></div>
      </Link>
      <nav className={open ? 'guest-links is-open' : 'guest-links'} aria-label="Guest navigation">
        <NavLink to="/guest/welcome" onClick={() => setOpen(false)}><BookOpen size={16} /> Welcome guide</NavLink>
        <NavLink to="/guest/home" onClick={() => setOpen(false)}><Home size={16} /> Home</NavLink>
        <Link className="guest-sign-in" to="/login" onClick={() => setOpen(false)}><LogIn size={16} /> Sign in</Link>
      </nav>
      <button className="guest-menu" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
};

export default GuestNavBar;
