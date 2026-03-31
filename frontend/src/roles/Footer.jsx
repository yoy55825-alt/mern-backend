import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-text">
          <h3>TaskWave</h3>
          <p>
            TaskWave is a premium assignment management platform that helps students
            and teachers organize, track, and manage academic tasks efficiently.
          </p>
        </div>
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>Email: kaungsatlinn9@gmail.com</p>
          <p>Phone: +95 9972728608</p>
          <p>Technological University(Mandalay)</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 TaskWave. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;