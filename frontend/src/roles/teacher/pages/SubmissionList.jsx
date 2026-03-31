import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SubmissionList.css';

const SubmissionList = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Fetch students and assignments separately
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch all students - store only names
        const studentsRes = await axios.get(`${API_URL}/api/index`);
        const studentsMap = {};
        studentsRes.data.forEach(student => {
          studentsMap[student._id] =
            typeof student.name === "object"
              ? student.name.name
              : student.name;
        });
        setStudents(studentsMap);

        // Fetch all assignments - store only titles
        const assignmentsRes = await axios.get(`${API_URL}/api/assignment/fetchAll`);
        const assignmentsMap = {};
        assignmentsRes.data.data.forEach(assignment => {
          assignmentsMap[String(assignment._id)] =
            typeof assignment.title === "object"
              ? assignment.title.title   // fallback if nested
              : assignment.title;
        });
        setAssignments(assignmentsMap);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();
  }, []);
  //use effect for fetch submissions
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/student/submission/fetchAll`);
      setSubmissions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionTypeIcon = (type) => {
    switch (type) {
      case 'online':
        return <i className="fas fa-laptop-code"></i>;
      case 'file':
        return <i className="fas fa-file-upload"></i>;
      case 'paper':
        return <i className="fas fa-file-alt"></i>;
      default:
        return <i className="fas fa-question-circle"></i>;
    }
  };

  const getStatusBadge = (submission) => {
    if (submission.status === 'graded') {
      return <span className="badge badge-success">✓ Graded</span>;
    } else if (submission.status === 'submitted') {
      return <span className="badge badge-warning">⏳ Pending</span>;
    } else {
      return <span className="badge badge-secondary">📝 Draft</span>;
    }
  };

  const getScoreDisplay = (submission) => {
    if (submission.status === 'graded') {
      if (submission.submissionType === 'online' && submission.onlineSubmission.score) {
        const { earned, total, percentage } = submission.onlineSubmission.score;
        return (
          <div className="score-wrapper">
            <span className="score-number">{earned}/{total}</span>
            <span className="score-percent">({percentage}%)</span>
          </div>
        );
      } else if (submission.grade && submission.grade.score !== undefined) {
        return (
          <div className="score-wrapper">
            <span className="score-number">{submission.grade.score}</span>
            <span className="score-label">points</span>
          </div>
        );
      }
    }
    return <span className="text-muted">—</span>;
  };

  const getSubmissionDetails = (submission) => {
    switch (submission.submissionType) {
      case 'online':
        return (
          <div className="details-list">
            <div className="detail-badge">
              <i className="fas fa-stopwatch"></i>
              <span>{formatTime(submission.onlineSubmission.timeSpent)}</span>
            </div>
            <div className="detail-badge">
              <i className="fas fa-redo-alt"></i>
              <span>{submission.onlineSubmission.attemptsCount} attempt(s)</span>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="details-list">
            <div className="detail-badge file-badge">
              <i className="fas fa-file-pdf"></i>
              <span>File Upload</span>
            </div>
            {submission.paperSubmission?.submitted && (
              <div className="detail-badge success-badge">
                <i className="fas fa-check"></i>
                <span>Submitted</span>
              </div>
            )}
          </div>
        );

      case 'paper':
        return (
          <div className="details-list">
            <div className="detail-badge paper-badge">
              <i className="fas fa-file-alt"></i>
              <span>Physical Copy</span>
            </div>
            {submission.paperSubmission?.submitted && (
              <div className="detail-badge success-badge">
                <i className="fas fa-check"></i>
                <span>Submitted</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (submission) => {
    navigate(`/teacher/submission/${submission._id}`);
  };

  const handleGradeSubmission = (submission) => {
    if (submission.submissionType === 'file') {
      navigate(`/teacher/submission/grade/file/${submission._id}`);
    } else if (submission.submissionType === 'paper') {
      navigate(`/teacher/grade/paper/${submission._id}`);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filterType !== 'all' && submission.submissionType !== filterType) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'graded' && submission.status !== 'graded') return false;
      if (filterStatus === 'pending' && submission.status !== 'submitted') return false;
    }
    return true;
  });

  const statistics = {
    total: submissions.length,
    online: submissions.filter(s => s.submissionType === 'online').length,
    file: submissions.filter(s => s.submissionType === 'file').length,
    paper: submissions.filter(s => s.submissionType === 'paper').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    pending: submissions.filter(s => s.status === 'submitted').length,
  };

  if (loading) {
    return (
      <div className="submissions-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-page">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchSubmissions} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="submissions-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Submissions</h1>
            <p className="subtitle">Review and grade student submissions</p>
          </div>
          <button onClick={() => navigate('/teacher/dashboard')} className="btn-secondary">
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon total">
              <i className="fas fa-inbox"></i>
            </div>
            <div className="stat-content">
              <h3>Total</h3>
              <p>{statistics.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon online">
              <i className="fas fa-laptop-code"></i>
            </div>
            <div className="stat-content">
              <h3>Online</h3>
              <p>{statistics.online}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon file">
              <i className="fas fa-file-upload"></i>
            </div>
            <div className="stat-content">
              <h3>File Upload</h3>
              <p>{statistics.file}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon paper">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="stat-content">
              <h3>Paper</h3>
              <p>{statistics.paper}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon graded">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>Graded</h3>
              <p>{statistics.graded}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p>{statistics.pending}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="online">Online</option>
              <option value="file">File Upload</option>
              <option value="paper">Paper</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="graded">Graded</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No submissions found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="submissions-grid">
            {filteredSubmissions.map((submission) => (
              <div key={submission._id} className={`submission-card ${submission.submissionType}`}>
                <div className="card-header">
                  <div className="type-indicator">
                    <span className="type-icon">{getSubmissionTypeIcon(submission.submissionType)}</span>
                    <span className="type-name">{submission.submissionType.toUpperCase()}</span>
                  </div>
                  {getStatusBadge(submission)}
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Assignment ID</span>
                    <span className="info-value">
                      {assignments[String(submission.assignmentId)]?.title
                        || assignments[String(submission.assignmentId)]
                        || submission.assignmentId}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Student ID</span>
                    <span className="info-value">{students[submission.studentId] || submission.studentId}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Submitted</span>
                    <span className="info-value">{formatDate(submission.submittedAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Score</span>
                    <span className="info-value score">{getScoreDisplay(submission)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Details</span>
                    <div className="info-value details">{getSubmissionDetails(submission)}</div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="btn-outline" onClick={() => handleViewDetails(submission)}>
                    <i className="fas fa-eye"></i>
                    View Details
                  </button>
                  {submission.status !== 'graded' && (
                    <button className="btn-primary" onClick={() => handleGradeSubmission(submission)}>
                      <i className="fas fa-edit"></i>
                      Grade
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;