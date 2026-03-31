
import "./Home.css";
import Footer from "./Footer";
import { FaChalkboardTeacher, FaUserGraduate, FaLock, FaBell, FaLaptop } from "react-icons/fa";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { Outlet } from "react-router";
function Home() {
    const supervisor = {
    name: "Tr Cho Mi Mi Maung",
    role: "Project Supervisor",
    img: "photo_2026-03-31_21-30-00.jpg",
    description: "Guiding and supporting the team throughout the project.",
  };
  const navigate=useNavigate();

  const teamMembers = [
    {
      name: "Phyo Zeyar Myint",
      role: "Mage",
      img: "photo_2026-03-31_21-29-50.jpg",
      description: "Strong problem-solving skills.",
    },
    {
      name: "Kaung Sat Linn",
      role: "Jungler",
      img: "photo_2026-03-31_21-29-41.jpg",
      description: "Creating clean and modern interfaces.",
    },
    {
      name: "Zwe Lin Htet",
      role: "Exp Laner",
      img: "photo_2026-03-31_21-29-55.jpg",
      description: "Passionate about UI/UX design.",
    },
    {
      name: "Thamudaya Zaw",
      role: "Support",
      img: "photo_2026-03-31_21-29-46.jpg",
      description: "Focusing on scalable systems.",
    },
    {
      name: "Min Khant Hein",
      role: "Gold Laner",
      img: "photo_2026-03-31_21-30-00.jpg",
      description: "Ensuring smooth development flow.",
    },
  ];

  return (
    <div className="home-container">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <img src="/webicon7.png" alt="logo" />
          <h1>TaskWave</h1>
        </div>
        <Link to={'/login'}>
          Login
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-overlay">
          <div className="about-content">
            <h1>Welcome to TaskWave</h1>
            <p>
              A smarter way to manage assignments, track progress,
               and collaborate
              seamlessly. Designed for students and teachers to stay organized and
              productive anytime, anywhere.
            </p>
          </div>
        </div>
      </section>
<section className="info-section">
  <h2>Functionalities</h2>
  <p className="section-subtitle">
    Designed to support both teachers and students efficiently.
  </p>

  <div className="info-grid">

    {/* TEACHER */}
    <div className="info-card">
      <div className="icon blue">  <FaChalkboardTeacher /></div>
      <h3>Teachers</h3>
      <ul>
        <li>✔ Creating, editing, and deleting assignments</li>
        <li>✔ Assigning deadlines and instructions</li>
        <li>✔ Viewing reports on submitted and pending assignments</li>
      </ul>
    </div>

    {/* STUDENT */}
    <div className="info-card">
      <div className="icon orange"><FaUserGraduate /></div>
      <h3>Students</h3>
      <ul>
        <li>✔ Viewing assigned tasks and deadlines</li>
        <li>✔ Submitting assignments online</li>
        <li>✔ Tracking submission status and feedback</li>
      </ul>
    </div>

  </div>
</section>

<section className="features-section">
  <h2>System Features</h2>
  <p className="section-subtitle">
    Powerful features that make TaskWave reliable and efficient.
  </p>

  <div className="features-grid">

    <div className="feature-card">
      <div className="icon green"><FaLock /></div>
      <h3>Role-Based Authentication</h3>
      <p>Secure login system for both teachers and students.</p>
    </div>

    <div className="feature-card">
      <div className="icon orange"><FaBell /></div>
      <h3>Real-Time Tracking</h3>
      <p>Get instant updates and notifications on assignments.</p>
    </div>

    <div className="feature-card">
      <div className="icon blue">  <FaLaptop /></div>
      <h3>Web-Based Access</h3>
      <p>Accessible on desktops and mobile devices anytime.</p>
    </div>

  </div>
</section>
      {/* ABOUT US */}
      <section className="team-section fade-in">
        <h2>About Us</h2>
            <div className="supervisor-container">
          <div className="supervisor-card">
            <img src={supervisor.img} alt={supervisor.name} />
            <h3>{supervisor.name}</h3>
            <h4>{supervisor.role}</h4>
            <p>{supervisor.description}</p>
          </div>
        </div>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div className="team-card animate-card" key={index}>
              <img src={member.img} alt={member.name} />
              <h3>{member.name}</h3>
              <h4>{member.role}</h4>
              <p>{member.description}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer/>
    </div>
    
  );
}

export default Home;