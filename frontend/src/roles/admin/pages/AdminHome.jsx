import { FaBookOpen, FaFlask, FaUsers } from 'react-icons/fa'
import './AdminHome.css'

const highlights = [
  {
    icon: <FaBookOpen />,
    title: 'Academic Excellence',
    description: 'Engineering and technology education',
  },
  {
    icon: <FaFlask />,
    title: 'Innovation',
    description: 'Research, laboratories, and student projects',
  },
  {
    icon: <FaUsers />,
    title: 'Campus Life',
    description: 'Activities, clubs, and events',
  },
]

const AdminHome = () => (
  <div className="tum-home">
    <header className="tum-home-header">
      <img src="/tum-logo.jpg" alt="Technological University Mandalay crest" />
      <div>
        <span>Welcome to</span>
        <h1>Technological University (Mandalay)</h1>
      </div>
    </header>

    <main>
      <section className="tum-hero" aria-labelledby="tum-welcome-title">
        <img src="/tum-campus.jpg" alt="Main building of Technological University Mandalay" />
        <div className="tum-hero-overlay"></div>
        <div className="tum-hero-content">
          <p className="tum-eyebrow">Learn · Create · Lead</p>
          <h2 id="tum-welcome-title">Welcome to Technological University (Mandalay)</h2>
          <p>Inspiring innovation, engineering excellence, and future leaders.</p>
        </div>
      </section>

      <section className="tum-highlights" aria-label="University highlights">
        {highlights.map((highlight) => (
          <article className="tum-info-card" key={highlight.title}>
            <div className="tum-info-icon">{highlight.icon}</div>
            <div>
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="tum-about">
        <p className="tum-section-label">Our university</p>
        <h2>About TUM</h2>
        <p>
          Technological University (Mandalay) is a community where curiosity becomes practical
          knowledge. Through engineering education, hands-on learning, and collaborative research,
          TUM prepares students to solve real-world challenges and help shape Myanmar's future.
        </p>
      </section>
    </main>
  </div>
)

export default AdminHome
