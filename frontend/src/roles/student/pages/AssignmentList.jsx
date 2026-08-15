import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../../context/userContext';
import './AssignmentList.css';
import { useNavigate } from 'react-router';

const AssignmentList = () => {
  // State for assignments and loading
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsMap, setSubmissionsMap] = useState({}); // Store submission status for each assignment
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Get user from context
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    // Filter assignments whenever assignments data or user changes
    if (assignments.length > 0 && user) {
      filterAssignmentsByUser();
    }
  }, [assignments, user]);

  // Fetch submissions for the current user
  useEffect(() => {
    if (user && filteredAssignments.length > 0) {
      fetchUserSubmissions();
    }
  }, [user, filteredAssignments]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/api/student/assignment/fetchAll`);
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('We could not load your assignments. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's submissions to check status
  const fetchUserSubmissions = async () => {
    try {
      const submissionsPromises = filteredAssignments.map(assignment =>
        axios.get(`${API_URL}/api/student/submission/fetchSingle/${assignment._id}`, {
          params: { studentId: user.id } // or user.id depending on your schema
        }).catch(error => {
          // If no submission found, return null
          if (error.response?.status === 404) {
            return { data: null };
          }
          console.error(`Error fetching submission for assignment ${assignment._id}:`, error);
          return { data: null };
        })
      );

      const responses = await Promise.all(submissionsPromises);
      const map = {};

      responses.forEach((response, index) => {
        const assignmentId = filteredAssignments[index]._id;
        const submission = response.data?.data;

        if (submission) {
          map[assignmentId] = {
            status: submission.status,
            submissionId: submission._id,
            submittedAt: submission.submittedAt
          };
        } else {
          map[assignmentId] = { status: 'pending', submissionId: null };
        }
      });

      setSubmissionsMap(map);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const filterAssignmentsByUser = () => {
    if (!user) {
      console.log('No user data available');
      setFilteredAssignments([]);
      return;
    }

    const { year, major, semester } = user;

    const filtered = assignments.filter(assignment => {
      const assignmentYear = assignment.targetYear;
      const assignmentMajor = assignment.targetMajor;
      const assignmentSemester = assignment.targetSemester;

      if (!assignmentYear && !assignmentMajor && !assignmentSemester) {
        return true;
      }

      const yearMatch = assignmentYear === year;
      const majorMatch = assignmentMajor === major;
      const semesterMatch = assignmentSemester === semester;

      return yearMatch && majorMatch && semesterMatch;
    });

    setFilteredAssignments(filtered);
  };

  const getDaysLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, deadline) => {
    const daysLeft = getDaysLeft(deadline);

    if (status === 'closed' || daysLeft < 0) {
      return { text: 'Closed', color: '#dc2626', bg: '#fee2e2' };
    } else if (daysLeft <= 3) {
      return { text: `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`, color: '#ea580c', bg: '#fff3e3' };
    } else if (daysLeft <= 7) {
      return { text: `Due in ${daysLeft} days`, color: '#eab308', bg: '#fefce8' };
    } else {
      return { text: `Due in ${daysLeft} days`, color: '#16a34a', bg: '#dcfce7' };
    }
  };

  // Get button text and style based on submission status
  const getSubmitButtonConfig = (assignmentId, submissionType, assignmentStatus, deadline) => {
    const submissionStatus = submissionsMap[assignmentId]?.status;
    const isPastDeadline = new Date(deadline) < new Date();

    // Check various states
    if (submissionStatus === 'submitted') {
      return {
        show: false,
        disabled: true,
        text: 'Submitted',
        icon: 'fa-check-circle',
        className: 'submitted'
      };
    }

    if (submissionStatus === 'graded') {
      return {
        show: false,
        disabled: true,
        text: 'Graded',
        icon: 'fa-star',
        className: 'graded'
      };
    }

    if (submissionStatus === 'late') {
      return {
        show: true,
        disabled: false,
        text: submissionType === 'online' ? 'Submit Late' : 'Upload Late',
        icon: submissionType === 'online' ? 'fa-pen-alt' : 'fa-upload',
        className: 'late-submit'
      };
    }

    if (submissionStatus === 'absent') {
      return {
        show: false,
        disabled: true,
        text: 'Absent',
        icon: 'fa-times-circle',
        className: 'absent'
      };
    }

    if (assignmentStatus === 'closed' || isPastDeadline) {
      return {
        show: false,
        disabled: true,
        text: 'Submission Closed',
        icon: 'fa-ban',
        className: 'closed'
      };
    }

    if (submissionType === 'none') {
      return {
        show: false,
        disabled: true,
        text: 'No Submission Required',
        icon: 'fa-info-circle',
        className: 'none'
      };
    }

    if (submissionType === 'paper') {
      return {
        show: false,
        disabled: true,
        text: 'Paper Submission',
        icon: 'fa-file-alt',
        className: 'paper'
      };
    }

    // Default - show submit button
    return {
      show: true,
      disabled: false,
      text: submissionType === 'online' ? 'Submit Online' : 'Upload File',
      icon: submissionType === 'online' ? 'fa-pen-alt' : 'fa-upload',
      className: submissionType
    };
  };

  const handleSubmit = (assignmentId, submissionType) => {
    // Check if already submitted before navigating
    const submissionStatus = submissionsMap[assignmentId]?.status;

    if (submissionStatus === 'submitted' || submissionStatus === 'graded') {
      alert('You have already submitted this assignment.');
      return;
    }

    if (submissionType === 'online') {
      navigate('/student/online/' + assignmentId);
    } else if (submissionType === 'file') {
      navigate('/student/fileUpload/' + assignmentId);
    }
  };

  const getSubmissionTypeDisplay = (submissionType) => {
    switch (submissionType) {
      case 'online':
        return { text: 'Online Quiz', icon: 'fa-laptop-code', color: 'online' };
      case 'file':
        return { text: 'File Upload', icon: 'fa-file-upload', color: 'file' };
      case 'paper':
        return { text: 'Paper Submission', icon: 'fa-file-alt', color: 'paper' };
      default:
        return { text: 'Read Only', icon: 'fa-eye', color: 'none' };
    }
  };

  const completedStatuses = ['submitted', 'graded', 'late'];
  const isCompleted = (assignmentId) => completedStatuses.includes(submissionsMap[assignmentId]?.status);
  const isClosed = (assignment) => assignment.status === 'closed' || new Date(assignment.deadLine) < new Date();
  const assignmentStats = {
    all: filteredAssignments.length,
    due: filteredAssignments.filter((assignment) => !isClosed(assignment) && !isCompleted(assignment._id)).length,
    submitted: filteredAssignments.filter((assignment) => isCompleted(assignment._id)).length,
    closed: filteredAssignments.filter((assignment) => isClosed(assignment) && !isCompleted(assignment._id)).length
  };
  const visibleAssignments = filteredAssignments
    .filter((assignment) => {
      if (activeFilter === 'due') return !isClosed(assignment) && !isCompleted(assignment._id);
      if (activeFilter === 'submitted') return isCompleted(assignment._id);
      if (activeFilter === 'closed') return isClosed(assignment) && !isCompleted(assignment._id);
      return true;
    })
    .filter((assignment) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return [assignment.title, assignment.description, assignment.teacherName, assignment.targetMajor]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    })
    .sort((a, b) => new Date(a.deadLine) - new Date(b.deadLine));

  const nextDueAssignment = filteredAssignments
    .filter((assignment) => !isClosed(assignment) && !isCompleted(assignment._id))
    .sort((a, b) => new Date(a.deadLine) - new Date(b.deadLine))[0];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  const getUserInfoDisplay = () => {
    if (!user) return null;
    return (
      <div className="user-info-banner">
        <i className="fas fa-user-graduate"></i>
        <span>
          {user.name} <span aria-hidden="true">/</span> Year {user.year} <span aria-hidden="true">/</span> {user.major} <span aria-hidden="true">/</span> {user.semester === 'first' ? 'First Semester' : 'Second Semester'}
        </span>
      </div>
    );
  };

  if (error) {
    return (
      <main className="assignment-list-container">
        <div className="error-state" role="alert">
          <div className="state-icon"><i className="fas fa-wifi"></i></div>
          <h2>Assignments are unavailable</h2>
          <p>{error}</p>
          <button type="button" onClick={fetchAssignments}><i className="fas fa-rotate-right"></i> Try again</button>
        </div>
      </main>
    );
  }

  if (filteredAssignments.length === 0) {
    return (
      <div className="assignment-list-container">
        <div className="header-section">
          <h1 className="page-title">
            <i className="fas fa-tasks"></i>
            Assignments
          </h1>
          <p className="subtitle">Track your deadlines and submit your work</p>
        </div>
        {getUserInfoDisplay()}
        <div className="empty-state">
          <i className="fas fa-inbox"></i>
          <h3>No assignments found</h3>
          <p>No assignments match your year, major, and semester criteria</p>
          {user && (
            <p className="empty-state-hint">
              You are in Year {user.year}, {user.major}, {user.semester === 'first' ? 'First' : 'Second'} Semester
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="assignment-list-container">
      <section className="assignment-hero">
        <div className="header-section">
          <div className="eyebrow"><i className="fas fa-graduation-cap"></i> Student workspace</div>
          <h1 className="page-title">Your assignments</h1>
          <p className="subtitle">Stay on top of coursework, deadlines, and submissions.</p>
        </div>
        {nextDueAssignment && (
          <div className="next-deadline-card">
            <span>Next deadline</span>
            <strong>{nextDueAssignment.title}</strong>
            <small><i className="fas fa-calendar-day"></i> {formatDeadline(nextDueAssignment.deadLine)}</small>
          </div>
        )}
      </section>

      {getUserInfoDisplay()}

      <div className="list-toolbar">
        <div><h2>Coursework</h2><p>{visibleAssignments.length} assignment{visibleAssignments.length !== 1 ? 's' : ''} shown</p></div>
        <div className="toolbar-actions">
          <label className="assignment-search">
            <span className="sr-only">Search assignments</span>
            <i className="fas fa-magnifying-glass"></i>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search assignments" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search"><i className="fas fa-xmark"></i></button>}
          </label>
          <div className="filter-tabs" aria-label="Filter assignments">
            {[["all", "All"], ["due", "To do"], ["submitted", "Completed"], ["closed", "Closed"]].map(([value, label]) => (
              <button type="button" key={value} className={activeFilter === value ? 'active' : ''} onClick={() => setActiveFilter(value)} aria-pressed={activeFilter === value}>{label}<span>{assignmentStats[value]}</span></button>
            ))}
          </div>
        </div>
      </div>

      <div className="assignments-grid">
        {visibleAssignments.map((assignment) => {
          const daysLeft = getDaysLeft(assignment.deadLine);
          const statusBadge = getStatusBadge(assignment.status, assignment.deadLine);
          const isPastDeadline = new Date(assignment.deadLine) < new Date();
          const submissionDisplay = getSubmissionTypeDisplay(assignment.submissionType);
          const buttonConfig = getSubmitButtonConfig(assignment._id, assignment.submissionType, assignment.status, assignment.deadLine);
          const submissionStatus = submissionsMap[assignment._id]?.status;

          return (
            <article key={assignment._id} className={`assignment-card card-type-${assignment.submissionType || 'none'} ${isPastDeadline ? 'assignment-card-closed' : ''}`}>
              <div className="card-header">
                <div className="header-left">
                  <span className={`assignment-type-badge assignment-type-${submissionDisplay.color}`} data-type={assignment.submissionType}>
                    <i className={`fas ${submissionDisplay.icon}`}></i>
                    {submissionDisplay.text}
                  </span>
                  <span className="points-badge">
                    <i className="fas fa-star"></i> {assignment.totalPoints || 0} pts
                  </span>
                </div>
                <span className={`status-badge ${assignment.status === 'closed' || isPastDeadline ? 'status-closed' : 'status-open'}`}>
                  <i className={`fas ${assignment.status === 'closed' || isPastDeadline ? 'fa-lock' : 'fa-clock'}`}></i>
                  {statusBadge.text}
                </span>
              </div>

              <div className="card-body">
                <h2 className="assignment-title">{assignment.title}</h2>
                <p className="assignment-description">{assignment.description}</p>

                <div className="teacher-info">
                  <i className="fas fa-chalkboard-user"></i>
                  <span>{assignment.teacherName || 'Staff'}</span>
                </div>

                {assignment.targetYear && assignment.targetMajor && (
                  <div className="course-info">
                    <i className="fas fa-graduation-cap"></i>
                    <span>
                      Year {assignment.targetYear} <span aria-hidden="true">/</span> {assignment.targetMajor} <span aria-hidden="true">/</span>
                      {assignment.targetSemester === 'first' ? ' First Semester' : ' Second Semester'}
                    </span>
                  </div>
                )}

                {/* Show submission status if exists */}
                {submissionStatus && submissionStatus !== 'pending' && (
                  <div className={`submission-status-badge submission-status-${submissionStatus}`}>
                    <i className={`fas ${submissionStatus === 'submitted' ? 'fa-check-circle' :
                      submissionStatus === 'graded' ? 'fa-star' :
                        submissionStatus === 'late' ? 'fa-clock' :
                          'fa-times-circle'
                      }`}></i>
                    <span>
                      {submissionStatus === 'submitted' && 'Submitted - Awaiting Grading'}
                      {submissionStatus === 'graded' && 'Graded'}
                      {submissionStatus === 'late' && 'Submitted Late'}
                      {submissionStatus === 'absent' && 'Absent - No Submission'}
                    </span>
                  </div>
                )}

                <div className={`deadline-section ${isPastDeadline ? 'deadline-past' : ''}`}>
                  <div className="deadline-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="deadline-details">
                    <div className="deadline-label">Submission Deadline</div>
                    <div className="deadline-date">{formatDeadline(assignment.deadLine)}</div>
                    {!isPastDeadline && daysLeft >= 0 && (
                      <div className={`days-left ${daysLeft <= 3 ? 'urgent' : ''}`}>
                        <i className="fas fa-hourglass-half"></i>
                        {daysLeft === 0 ? ' Due today!' : ` ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                      </div>
                    )}
                    {isPastDeadline && submissionStatus !== 'submitted' && submissionStatus !== 'late' && (
                      <div className="expired-badge">
                        <i className="fas fa-exclamation-circle"></i>
                        Deadline passed
                      </div>
                    )}
                  </div>
                </div>

                {assignment.questions && assignment.questions.length > 0 && (
                  <div className="questions-preview">
                    <i className="fas fa-question-circle"></i>
                    <span>{assignment.questions.length} question{assignment.questions.length !== 1 ? 's' : ''}</span>
                    {assignment.questionType && <span> / {assignment.questionType === 'true_false' ? 'True/False' : assignment.questionType === 'multiple_choice' ? 'Multiple Choice' : assignment.questionType}</span>}
                  </div>
                )}
              </div>

              <div className="card-footer">
                {buttonConfig.show ? (
                  <button
                    className={`submit-btn submit-btn-${buttonConfig.className}`}
                    onClick={() => handleSubmit(assignment._id, assignment.submissionType)}
                    disabled={buttonConfig.disabled}
                  >
                    <i className={`fas ${buttonConfig.icon}`}></i>
                    {buttonConfig.text}
                  </button>
                ) : (
                  <div className={`disabled-submit disabled-submit-${buttonConfig.className}`}>
                    <i className={`fas ${buttonConfig.icon}`}></i>
                    {buttonConfig.text}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {visibleAssignments.length === 0 && <div className="filter-empty"><div className="state-icon"><i className={`fas ${searchQuery ? 'fa-magnifying-glass' : 'fa-check-circle'}`}></i></div><h3>{searchQuery ? 'No matching assignments' : 'Nothing here right now'}</h3><p>{searchQuery ? 'Try a different title, teacher, or course.' : 'Try another filter to see your assignments.'}</p>{searchQuery && <button type="button" onClick={() => setSearchQuery('')}>Clear search</button>}</div>}
    </main>
  );
};

export default AssignmentList;
