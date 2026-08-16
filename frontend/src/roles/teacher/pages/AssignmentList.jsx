import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowRight, FaBookOpen, FaCalendarAlt, FaCheckCircle, FaClock,
  FaEdit, FaFileAlt, FaPlus, FaRedoAlt, FaSearch, FaTimes, FaTrashAlt,
  FaUsers, FaExclamationTriangle,
} from 'react-icons/fa';
import { UserContext } from '../../../context/userContext';
import './AssignmentList.css';

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const { user } = useContext(UserContext);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/api/teacher/assignment/fetchAll`);
      setAssignments(response.data.data || []);
    } catch (requestError) {
      console.error('Error fetching assignments:', requestError);
      setError('We could not load your assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const myAssignments = assignments.filter(
    (assignment) => assignment.createdBy?.toString() === user?.id?.toString(),
  );

  const stats = {
    all: myAssignments.length,
    active: myAssignments.filter((assignment) => assignment.status === 'active').length,
    draft: myAssignments.filter((assignment) => assignment.status === 'draft').length,
    closed: myAssignments.filter((assignment) => assignment.status === 'closed').length,
  };

  const filteredAssignments = myAssignments
    .filter((assignment) => filter === 'all' || assignment.status === filter)
    .filter((assignment) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return [assignment.title, assignment.description, assignment.targetMajor]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    })
    .sort((a, b) => new Date(a.deadLine) - new Date(b.deadLine));

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const getDeadlineInfo = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
    if (days < 0) return { label: 'Deadline passed', tone: 'past' };
    if (days === 0) return { label: 'Due today', tone: 'urgent' };
    if (days <= 3) return { label: `${days} day${days === 1 ? '' : 's'} left`, tone: 'urgent' };
    return { label: `${days} days left`, tone: 'normal' };
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/api/teacher/assignment/delete/${assignmentToDelete._id}`);
      setAssignments((current) => current.filter((item) => item._id !== assignmentToDelete._id));
      setAssignmentToDelete(null);
    } catch (deleteError) {
      console.error('Error deleting assignment:', deleteError);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="teacher-assignments-page">
      <section className="teacher-assignments-shell">
        <header className="teacher-assignment-hero">
          <div>
            <span className="teacher-eyebrow"><FaBookOpen /> Coursework manager</span>
            <h1>My assignments</h1>
            <p>Create, organize, and monitor coursework for your students.</p>
          </div>
          <Link to="/teacher/assignment/questionType" className="teacher-create-button">
            <FaPlus /> Create assignment
          </Link>
        </header>

        <section className="teacher-stats" aria-label="Assignment summary">
          {[
            ['all', 'All assignments', <FaFileAlt />],
            ['active', 'Published', <FaCheckCircle />],
            ['draft', 'Drafts', <FaEdit />],
            ['closed', 'Closed', <FaClock />],
          ].map(([value, label, icon]) => (
            <button key={value} type="button" className={`teacher-stat stat-${value}`} onClick={() => setFilter(value)} aria-pressed={filter === value}>
              <span>{icon}</span><strong>{stats[value]}</strong><small>{label}</small>
            </button>
          ))}
        </section>

        <section className="teacher-assignment-toolbar">
          <div>
            <h2>Coursework</h2>
            <p>{filteredAssignments.length} assignment{filteredAssignments.length === 1 ? '' : 's'} shown</p>
          </div>
          <div className="teacher-toolbar-actions">
            <label className="teacher-assignment-search">
              <FaSearch /><span className="teacher-sr-only">Search assignments</span>
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by title, course or description" autoComplete="off" />
              {searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search"><FaTimes /></button>}
            </label>
            <div className="teacher-filter-tabs" aria-label="Filter by status">
              {[['all', 'All'], ['active', 'Published'], ['draft', 'Drafts'], ['closed', 'Closed']].map(([value, label]) => (
                <button key={value} type="button" className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>
              ))}
            </div>
            <button type="button" className="teacher-refresh" onClick={fetchAssignments} aria-label="Refresh assignments"><FaRedoAlt /></button>
          </div>
        </section>

        {loading && <div className="teacher-loading"><span></span><p>Loading assignments...</p></div>}

        {!loading && error && (
          <div className="teacher-state teacher-error" role="alert">
            <span><FaExclamationTriangle /></span><h2>Unable to load assignments</h2><p>{error}</p>
            <button type="button" onClick={fetchAssignments}>Try again</button>
          </div>
        )}

        {!loading && !error && filteredAssignments.length === 0 && (
          <div className="teacher-state">
            <span><FaFileAlt /></span><h2>{searchTerm ? 'No matching assignments' : 'No assignments here yet'}</h2>
            <p>{searchTerm ? 'Try another title, description, or course.' : 'Create your first assignment to get started.'}</p>
            {searchTerm ? <button type="button" onClick={() => setSearchTerm('')}>Clear search</button> : <Link to="/teacher/assignment/questionType">Create assignment</Link>}
          </div>
        )}

        {!loading && !error && filteredAssignments.length > 0 && (
          <section className="teacher-assignment-grid">
            {filteredAssignments.map((assignment) => {
              const deadline = getDeadlineInfo(assignment.deadLine);
              return (
                <article key={assignment._id} className={`teacher-assignment-card card-${assignment.status}`}>
                  <div className="teacher-card-top">
                    <span className={`teacher-status status-${assignment.status}`}><i></i>{assignment.status}</span>
                    <span className="teacher-points">{assignment.totalPoints || 0} pts</span>
                  </div>
                  <div className="teacher-card-content">
                    <h2>{assignment.title}</h2>
                    <p className="teacher-card-description">{assignment.description || 'No description provided.'}</p>
                    <div className="teacher-card-meta">
                      <div><span><FaUsers /></span><p><small>Audience</small><strong>Year {assignment.targetYear || 'All'} / {assignment.targetMajor || 'All majors'}</strong></p></div>
                      <div><span><FaCalendarAlt /></span><p><small>Deadline</small><strong>{formatDate(assignment.deadLine)}</strong><em className={deadline.tone}>{deadline.label}</em></p></div>
                    </div>
                  </div>
                  <footer className="teacher-card-footer">
                    <Link to={`/teacher/assignment/detail/${assignment._id}`} className="teacher-view-action">View details <FaArrowRight /></Link>
                    {assignment.status === 'draft' && (
                      <div className="teacher-draft-actions">
                        <Link to={`/teacher/editAssignment/${assignment._id}`} aria-label={`Edit ${assignment.title}`}><FaEdit /></Link>
                        <button type="button" onClick={() => setAssignmentToDelete(assignment)} aria-label={`Delete ${assignment.title}`}><FaTrashAlt /></button>
                      </div>
                    )}
                  </footer>
                </article>
              );
            })}
          </section>
        )}
      </section>

      {assignmentToDelete && (
        <div className="teacher-modal-backdrop" role="presentation" onMouseDown={() => !deleteLoading && setAssignmentToDelete(null)}>
          <section className="teacher-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="teacher-delete-icon"><FaTrashAlt /></span>
            <h2 id="delete-title">Delete assignment?</h2>
            <p>“{assignmentToDelete.title}” will be permanently removed. This action cannot be undone.</p>
            <div>
              <button type="button" className="teacher-cancel-delete" onClick={() => setAssignmentToDelete(null)} disabled={deleteLoading}>Cancel</button>
              <button type="button" className="teacher-confirm-delete" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete assignment'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default AssignmentsList;
