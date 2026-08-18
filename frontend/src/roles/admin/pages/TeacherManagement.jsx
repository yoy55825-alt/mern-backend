import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Building2,
  ChevronDown,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import "./TeacherManagement.css";

const getInitials = (name = "Teacher") =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    let isMounted = true;

    const loadTeachers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_URL}/api/index`);
        const users = Array.isArray(res.data) ? res.data : [];
        if (isMounted) setTeachers(users.filter((user) => user.role === "teacher"));
      } catch (requestError) {
        console.error("Failed to load teachers:", requestError);
        if (isMounted) setError("We couldn't load the teacher list. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTeachers();
    return () => { isMounted = false; };
  }, [API_URL]);

  const departments = useMemo(
    () => [...new Set(teachers.map((teacher) => teacher.teacherProfile?.department).filter(Boolean))].sort(),
    [teachers],
  );

  const courseCount = useMemo(
    () => new Set(teachers.flatMap((teacher) => teacher.teacherProfile?.coursesTeaching || []).filter(Boolean)).size,
    [teachers],
  );

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const profile = teacher.teacherProfile || {};
      const matchesDepartment = department === "all" || profile.department === department;
      const matchesSearch = !term || [
        teacher.name,
        teacher.email,
        profile.department,
        ...(profile.coursesTeaching || []),
      ].some((value) => String(value || "").toLowerCase().includes(term));
      return matchesDepartment && matchesSearch;
    });
  }, [department, search, teachers]);

  const deleteTeacher = async (teacher) => {
    // if (!window.confirm(`Remove ${teacher.name || "this teacher"}? This action cannot be undone.`)) return;

    try {
      setDeletingId(teacher._id);
      setError("");
      await axios.delete(`${API_URL}/api/user/delete/${teacher._id}`);
      setTeachers((current) => current.filter((item) => item._id !== teacher._id));
    } catch (requestError) {
      console.error("Failed to delete teacher:", requestError);
      setError("The teacher could not be removed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="teacher-management">
      <section className="teacher-hero">
        <div>
          <p className="teacher-eyebrow">Faculty directory</p>
          <h1>Teacher management</h1>
          <p className="teacher-subtitle">Manage faculty profiles, departments, and teaching assignments.</p>
        </div>
        <Link to="/admin/createAcc" className="teacher-add-button">
          <Plus size={18} strokeWidth={2.5} /> Add teacher
        </Link>
      </section>

      <section className="teacher-stats" aria-label="Teacher summary">
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon purple"><Users size={20} /></span>
          <div><strong>{teachers.length}</strong><span>Total teachers</span></div>
        </article>
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon green"><Building2 size={20} /></span>
          <div><strong>{departments.length}</strong><span>Departments</span></div>
        </article>
        <article className="teacher-stat-card">
          <span className="teacher-stat-icon orange"><BookOpen size={20} /></span>
          <div><strong>{courseCount}</strong><span>Courses covered</span></div>
        </article>
      </section>

      <section className="teacher-directory">
        <div className="teacher-directory-header">
          <div>
            <h2>All teachers</h2>
            <p>{filteredTeachers.length} {filteredTeachers.length === 1 ? "record" : "records"} shown</p>
          </div>
          <div className="teacher-tools">
            <label className="teacher-search">
              <Search size={18} aria-hidden="true" />
              <input type="search" placeholder="Search teacher, email or course" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search teachers" />
            </label>
            <label className="department-filter">
              <select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">
                <option value="all">All departments</option>
                {departments.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </div>
        </div>

        {error && <div className="teacher-alert" role="alert">{error}</div>}

        <div className="teacher-table" role="table" aria-label="Teacher directory">
          <div className="teacher-table-head" role="row">
            <span>Teacher</span><span>Department</span><span>Courses</span><span>Workload</span><span>Actions</span>
          </div>

          {loading ? (
            <div className="teacher-state"><span className="teacher-spinner" /><p>Loading teacher records…</p></div>
          ) : filteredTeachers.length === 0 ? (
            <div className="teacher-state">
              <span className="teacher-empty-icon"><Search size={24} /></span>
              <h3>{teachers.length ? "No matching teachers" : "No teachers yet"}</h3>
              <p>{teachers.length ? "Try a different search or department filter." : "Add your first teacher to begin building the faculty directory."}</p>
            </div>
          ) : (
            <div className="teacher-table-body">
              {filteredTeachers.map((teacher) => {
                const profile = teacher.teacherProfile || {};
                const courses = profile.coursesTeaching || [];
                return (
                  <article className="teacher-row-new" role="row" key={teacher._id}>
                    <div className="teacher-identity" role="cell">
                      <span className="teacher-avatar">{getInitials(teacher.name)}</span>
                      <span className="teacher-name-wrap">
                        <strong>{teacher.name || "Unnamed teacher"}</strong>
                        <small><Mail size={13} />{teacher.email || "No email provided"}</small>
                      </span>
                    </div>
                    <span role="cell" data-label="Department"><em className="department-badge">{profile.department || "Unassigned"}</em></span>
                    <div className="course-list" role="cell" data-label="Courses">
                      {courses.length ? courses.slice(0, 2).map((course) => <span key={course}>{course}</span>) : <span className="no-course">No courses</span>}
                      {courses.length > 2 && <small>+{courses.length - 2} more</small>}
                    </div>
                    <span className="course-count" role="cell" data-label="Workload">{courses.length} {courses.length === 1 ? "course" : "courses"}</span>
                    <div className="teacher-actions" role="cell">
                      <Link to={`/admin/teacherUpdate/${teacher._id}`} className="teacher-icon-button edit" aria-label={`Edit ${teacher.name}`} title="Edit teacher"><Pencil size={17} /></Link>
                      <button className="teacher-icon-button remove" type="button" onClick={() => deleteTeacher(teacher)} disabled={deletingId === teacher._id} aria-label={`Delete ${teacher.name}`} title="Delete teacher">
                        {deletingId === teacher._id ? <span className="teacher-button-spinner" /> : <Trash2 size={17} />}
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

export default TeacherManagement;
