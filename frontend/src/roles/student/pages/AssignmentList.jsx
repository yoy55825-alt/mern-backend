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
  const [submissionsMap, setSubmissionsMap] = useState({}); // Store submission status for each assignment
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  // Fetch submissions for the current user
  useEffect(() => {
    if (user && filteredAssignments.length > 0) {
      fetchUserSubmissions();
    }
  }, [user, filteredAssignments]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/student/assignment/fetchAll`);
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
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

    console.log('Filtering assignments for:', { year, major, semester });

    const filtered = assignments.filter(assignment => {
      const assignmentYear = assignment.targetYear;
      const assignmentMajor = assignment.targetMajor;
      const assignmentSemester = assignment.targetSemester;

      if (!assignmentYear && !assignmentMajor && !assignmentSemester) {
        console.log('Assignment has no target fields, showing:', assignment.title);
        return true;
      }

      const yearMatch = assignmentYear === year;
      const majorMatch = assignmentMajor === major;
      const semesterMatch = assignmentSemester === semester;

      return yearMatch && majorMatch && semesterMatch;
    });

    console.log(`Filtered ${filtered.length} out of ${assignments.length} assignments`);
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

  // Updated function to check submission status
  const shouldShowSubmitButton = (assignmentId, submissionType, status, deadline) => {
    const isPastDeadline = new Date(deadline) < new Date();

    // Get submission status from the map
    const submissionStatus = submissionsMap[assignmentId]?.status;
    console.log(submissionStatus);

    // If already submitted, don't show submit button
    if (submissionStatus === 'submitted' || submissionStatus === 'graded') {
      return false;
    }

    // If late submission but still allowed (optional logic)
    if (submissionStatus === 'late' && isPastDeadline) {
      // You might want to allow late submissions or not
      // For now, we'll allow but show a warning
      return true;
    }

    if (submissionType === 'none' || submissionType === 'paper') return false;
    if (status === 'closed') return false;
    if (isPastDeadline) return false;
    return true;
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

  const handleSubmit = (assignmentId, submissionType, assignmentTitle, questionType) => {
    // Check if already submitted before navigating
    const submissionStatus = submissionsMap[assignmentId]?.status;

    if (submissionStatus === 'submitted' || submissionStatus === 'graded') {
      alert('You have already submitted this assignment.');
      return;
    }

    if (submissionType === 'online') {
      if (questionType === 'true_false') {
        navigate('/student/online/' + assignmentId);
      } else if (questionType === 'multiple_choice') {
        navigate('/student/online/mc/' + assignmentId);
      }else if (questionType === 'fill_blank'){
        navigate('/student/online/fillBlank/'+assignmentId)
      } else {
        navigate('/student/online/' + assignmentId);
      }
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
          const isPastDeadline = new Date(assignment.deadLine) < new Date();
          const submissionDisplay = getSubmissionTypeDisplay(assignment.submissionType);
          const buttonConfig = getSubmitButtonConfig(assignment._id, assignment.submissionType, assignment.status, assignment.deadLine);
          const submissionStatus = submissionsMap[assignment._id]?.status;

          return (
            <div key={assignment._id} className="assignment-card">
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
                      Year {assignment.targetYear} · {assignment.targetMajor} ·
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
                    {!isPastDeadline && daysLeft > 0 && (
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
                    {assignment.questionType && <span> · {assignment.questionType === 'true_false' ? 'True/False' : assignment.questionType === 'multiple_choice' ? 'Multiple Choice' : assignment.questionType}</span>}
                  </div>
                )}
              </div>

              <div className="card-footer">
                {buttonConfig.show ? (
                  <button
                    className={`submit-btn submit-btn-${buttonConfig.className}`}
                    onClick={() => handleSubmit(assignment._id, assignment.submissionType, assignment.title, assignment.questionType)}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentList;