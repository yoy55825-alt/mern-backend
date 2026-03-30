import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../../context/userContext';
import './AssignmentList.css';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';

const AssignmentList = () => {
  // State for assignments and loading
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user from context
  const { user } = useContext(UserContext);

  console.log('Current User:', user);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    // Filter assignments whenever assignments data or user changes
    if (assignments.length > 0 && user) {
      filterAssignmentsByUser();
    }
  }, [assignments, user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/student/assignment/fetchAll");
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on user's year, major, and semester
  const filterAssignmentsByUser = () => {
    if (!user) {
      console.log('No user data available');
      setFilteredAssignments([]);
      return;
    }

    const { year, major, semester } = user;

    console.log('Filtering assignments for:', { year, major, semester });

    const filtered = assignments.filter(assignment => {
      // Check if assignment has target fields
      const assignmentYear = assignment.targetYear;
      const assignmentMajor = assignment.targetMajor;
      const assignmentSemester = assignment.targetSemester;

      // If assignment doesn't have target fields, show it (fallback)
      if (!assignmentYear && !assignmentMajor && !assignmentSemester) {
        console.log('Assignment has no target fields, showing:', assignment.title);
        return true;
      }

      // Check if all conditions match
      const yearMatch = assignmentYear === year;
      const majorMatch = assignmentMajor === major;
      const semesterMatch = assignmentSemester === semester;

      // Log filtering decision
      const isMatch = yearMatch && majorMatch && semesterMatch;
      // if (isMatch) {
      //   console.log('✅ Assignment matched:', assignment.title);
      // } else {
      //   console.log('❌ Assignment filtered out:', assignment.title, {
      //     year: `${assignmentYear} vs ${year}`,
      //     major: `${assignmentMajor} vs ${major}`,
      //     semester: `${assignmentSemester} vs ${semester}`
      //   });
      // }

      return isMatch;
    });

    console.log(`Filtered ${filtered.length} out of ${assignments.length} assignments`);
    setFilteredAssignments(filtered);
  };

  // Function to calculate days left until deadline
  const getDaysLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to format deadline display
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

  // Function to get status badge color
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

  // Determine if submit button should be shown
  const shouldShowSubmitButton = (submissionType, status, deadline) => {
    const isPastDeadline = new Date(deadline) < new Date();
    if (submissionType === 'none' || submissionType === 'paper') return false;
    if (status === 'closed') return false;
    if (status === 'submitted') return false;
    if (isPastDeadline) return false;
    return true;
  };

  // Handle submit action
  const handleSubmit = (assignmentId, submissionType, assignmentTitle) => {
    if (submissionType === 'online') {
      navigate('/student/online/'+assignmentId)
    } else if (submissionType === 'file') {
      navigate('/student/fileUpload/' + assignmentId)
    }
  };

  // Get submission type display text
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  // Show user info banner
  const getUserInfoDisplay = () => {
    if (!user) return null;
    return (
      <div className="user-info-banner">
        <i className="fas fa-user-graduate"></i>
        <span>
          {user.name} · Year {user.year} · {user.major} · {user.semester === 'first' ? 'First Semester' : 'Second Semester'}
        </span>
      </div>
    );
  };

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
    <div className="assignment-list-container">
      <div className="header-section">
        <h1 className="page-title">
          <i className="fas fa-tasks"></i>
          Assignments
        </h1>
        <p className="subtitle">Track your deadlines and submit your work</p>
      </div>

      {getUserInfoDisplay()}

      <div className="assignments-stats">
        <span className="stats-badge">
          <i className="fas fa-book-open"></i>
          Showing {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="assignments-grid">
        {filteredAssignments.map((assignment) => {
          const daysLeft = getDaysLeft(assignment.deadLine);
          const statusBadge = getStatusBadge(assignment.status, assignment.deadLine);
          const showSubmit = shouldShowSubmitButton(assignment.submissionType, assignment.status, assignment.deadLine);
          const isPastDeadline = new Date(assignment.deadLine) < new Date();
          const submissionDisplay = getSubmissionTypeDisplay(assignment.submissionType);

          return (
            <div key={assignment._id} className="assignment-card">
              {/* Card Header with Status */}
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

              {/* Card Body */}
              <div className="card-body">
                <h2 className="assignment-title">{assignment.title}</h2>
                <p className="assignment-description">{assignment.description}</p>

                {/* Teacher Info */}
                <div className="teacher-info">
                  <i className="fas fa-chalkboard-user"></i>
                  <span>{assignment.teacherName || 'Staff'}</span>
                </div>

                {/* Course Context */}
                {assignment.targetYear && assignment.targetMajor && (
                  <div className="course-info">
                    <i className="fas fa-graduation-cap"></i>
                    <span>
                      Year {assignment.targetYear} · {assignment.targetMajor} ·
                      {assignment.targetSemester === 'first' ? ' First Semester' : ' Second Semester'}
                    </span>
                  </div>
                )}

                {/* Deadline Section */}
                <div className={`deadline-section ${isPastDeadline ? 'deadline-past' : ''}`}>
                  <div className="deadline-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="deadline-details">
                    <div className="deadline-label">Submission Deadline</div>
                    <div className="deadline-date">{formatDeadline(assignment.deadLine)}</div>
                    {!isPastDeadline && daysLeft > 0 && (
                      <div className={`days-left ${daysLeft <= 3 ? 'urgent' : ''}`}>
                        <i className="fas fa-hourglass-half"></i>
                        {daysLeft === 0 ? ' Due today!' : ` ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                      </div>
                    )}
                    {isPastDeadline && (
                      <div className="expired-badge">
                        <i className="fas fa-exclamation-circle"></i>
                        Deadline passed
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info from Questions if available */}
                {assignment.questions && assignment.questions.length > 0 && (
                  <div className="questions-preview">
                    <i className="fas fa-question-circle"></i>
                    <span>{assignment.questions.length} question{assignment.questions.length !== 1 ? 's' : ''}</span>
                    {assignment.questionType && <span> · {assignment.questionType === 'true_false' ? 'True/False' : assignment.questionType === 'multiple_choice' ? 'Multiple Choice' : assignment.questionType}</span>}
                  </div>
                )}
              </div>

              {/* Card Footer with Submit Button */}
              <div className="card-footer">
                {showSubmit ? (
                  <button
                    className={`submit-btn submit-btn-${assignment.submissionType}`}
                    onClick={() => handleSubmit(assignment._id, assignment.submissionType, assignment.title)}
                  >
                    {assignment.submissionType === 'online' ? (
                      <>
                        <i className="fas fa-pen-alt"></i>
                        Submit Online
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i>
                        Upload File
                      </>
                    )}
                  </button>
                ) : (
                  <div className="disabled-submit">
                    {assignment.submissionType === 'none' ? (
                      <>
                        <i className="fas fa-info-circle"></i>
                        No submission required
                      </>
                    ) : assignment.submissionType === 'paper' ? (
                      <>
                        <i className="fas fa-file-alt"></i>
                        Paper submission (offline)
                      </>
                    ) : (assignment.status === 'submitted') ? (
                      <>
                        <i className="fas fa-check-circle"></i>
                        Submitted
                      </>
                    ) : (assignment.status === 'closed' || isPastDeadline) ? (
                      <>
                        <i className="fas fa-ban"></i>
                        Submission closed
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentList;