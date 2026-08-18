import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import "./StudentManagement.css";

const getInitials = (name = "Student") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_URL}/api/index`);
        const users = Array.isArray(res.data) ? res.data : [];
        if (isMounted) setStudents(users.filter((user) => user.role === "student"));
      } catch (requestError) {
        console.error("Failed to load students:", requestError);
        if (isMounted) setError("We couldn't load the student list. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  const years = useMemo(
    () =>
      [...new Set(students.map((student) => student.studentProfile?.year).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const profile = student.studentProfile || {};
      const matchesYear = year === "all" || String(profile.year) === year;
      const matchesSearch = !term || [student.name, student.email, profile.major, profile.studentRollNumber]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesYear && matchesSearch;
    });
  }, [search, students, year]);

  const majorCount = new Set(students.map((student) => student.studentProfile?.major).filter(Boolean)).size;

  const deleteStudent = async (student) => {
    // if (!window.confirm(`Remove ${student.name || "this student"}? This action cannot be undone.`)) return;

    try {
      setDeletingId(student._id);
      setError("");
      await axios.delete(`${API_URL}/api/user/delete/${student._id}`);
      setStudents((current) => current.filter((item) => item._id !== student._id));
    } catch (requestError) {
      console.error("Failed to delete student:", requestError);
      setError("The student could not be removed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="student-management">
      <section className="student-hero">
        <div>
          <p className="student-eyebrow">Academic directory</p>
          <h1>Student management</h1>
          <p className="student-subtitle">Keep student records organized, current, and easy to find.</p>
        </div>
        <Link to="/admin/createAcc" className="student-add-button">
          <Plus size={18} strokeWidth={2.5} />
          Add student
        </Link>
      </section>

      <section className="student-stats" aria-label="Student summary">
        <article className="student-stat-card">
          <span className="stat-icon stat-icon-purple"><Users size={20} /></span>
          <div><strong>{students.length}</strong><span>Total students</span></div>
        </article>
        <article className="student-stat-card">
          <span className="stat-icon stat-icon-green"><BookOpen size={20} /></span>
          <div><strong>{majorCount}</strong><span>Active majors</span></div>
        </article>
        <article className="student-stat-card">
          <span className="stat-icon stat-icon-orange"><GraduationCap size={20} /></span>
          <div><strong>{years.length}</strong><span>Year groups</span></div>
        </article>
      </section>

      <section className="student-directory">
        <div className="directory-header">
          <div>
            <h2>All students</h2>
            <p>{filteredStudents.length} {filteredStudents.length === 1 ? "record" : "records"} shown</p>
          </div>
          <div className="directory-tools">
            <label className="student-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search name, email, major or roll no."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search students"
              />
            </label>
            <label className="year-filter">
              <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by year">
                <option value="all">All years</option>
                {years.map((item) => <option key={item} value={String(item)}>Year {item}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </div>
        </div>

        {error && <div className="student-alert" role="alert">{error}</div>}

        <div className="student-table" role="table" aria-label="Student directory">
          <div className="student-table-head" role="row">
            <span>Student</span><span>Roll number</span><span>Major</span><span>Year</span><span>Semester</span><span>Actions</span>
          </div>

          {loading ? (
            <div className="student-state"><span className="student-spinner" /><p>Loading student records…</p></div>
          ) : filteredStudents.length === 0 ? (
            <div className="student-state">
              <span className="empty-icon"><Search size={24} /></span>
              <h3>{students.length ? "No matching students" : "No students yet"}</h3>
              <p>{students.length ? "Try a different search or year filter." : "Add your first student to begin building the directory."}</p>
            </div>
          ) : (
            <div className="student-table-body">
              {filteredStudents.map((student) => {
                const profile = student.studentProfile || {};
                return (
                  <article className="student-row" role="row" key={student._id}>
                    <div className="student-identity" role="cell">
                      <span className="student-avatar">{getInitials(student.name)}</span>
                      <span className="student-name-wrap">
                        <strong>{student.name || "Unnamed student"}</strong>
                        <small><Mail size={13} />{student.email || "No email provided"}</small>
                      </span>
                    </div>
                    <span className="roll-number" role="cell" data-label="Roll number">{profile.studentRollNumber || "—"}</span>
                    <span role="cell" data-label="Major">{profile.major || "—"}</span>
                    <span role="cell" data-label="Year"><em className="year-badge">{profile.year ? `Year ${profile.year}` : "—"}</em></span>
                    <span role="cell" data-label="Semester">{profile.semester || "—"}</span>
                    <div className="student-actions" role="cell">
                      <Link to={`/admin/studentUpdate/${student._id}`} className="student-icon-button edit" aria-label={`Edit ${student.name}`} title="Edit student">
                        <Pencil size={17} />
                      </Link>
                      <button className="student-icon-button remove" type="button" onClick={() => deleteStudent(student)} disabled={deletingId === student._id} aria-label={`Delete ${student.name}`} title="Delete student">
                        {deletingId === student._id ? <span className="button-spinner" /> : <Trash2 size={17} />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default StudentManagement;
