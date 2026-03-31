import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GradingSubmission.css';

const GradeFileSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [gradeData, setGradeData] = useState({
    score: 0,
    maxScore: 0,
    feedback: '',
    status: 'graded'
  });
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    fetchSubmissionDetails();
  }, [submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      // Fetch submission details
      const submissionResponse = await axios.get(`${API_URL}/api/student/submission/fetch/subId/${submissionId}`);
      const submissionData = submissionResponse?.data?.submission[0] || [];
      setSubmission(submissionData);
      console.log(submission);
      // Fetch assignment details to get max score
      const assignmentResponse = await axios.get(`${API_URL}/api/teacher/assignment/detail/${submissionData.assignmentId}`);
      const assignmentData = assignmentResponse?.data || [];
      console.log(assignmentResponse);

      setAssignment(assignmentData);
      console.log(assignmentData);


      // Set max score from assignment
      setGradeData(prev => ({
        ...prev,
        maxScore: assignmentData.totalPoints || 10
      }));

      // If already graded, populate existing grade
      if (submissionData.grade && submissionData.grade.score !== undefined) {
        setGradeData({
          score: submissionData.grade.score,
          maxScore: assignmentData.totalPoints || 0,
          feedback: submissionData.grade.feedback || '',
          status: submissionData.status
        });
      }

    } catch (error) {
      console.error('Error fetching submission:', error);
      setError('Failed to load submission details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (value) => {
    let newScore = parseFloat(value);
    if (isNaN(newScore)) newScore = 0;
    newScore = Math.min(Math.max(0, newScore), gradeData.maxScore);
    setGradeData(prev => ({ ...prev, score: newScore }));
  };

  const handleFeedbackChange = (e) => {
    setGradeData(prev => ({ ...prev, feedback: e.target.value }));
  };

  const handleSubmitGrade = async () => {
    if (gradeData.score < 0 || gradeData.score > gradeData.maxScore) {
      setError(`Score must be between 0 and ${gradeData.maxScore}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const gradePayload = {
        score: gradeData.score,
        feedback: gradeData.feedback,
        status: 'graded',
        gradedAt: new Date().toISOString()
      };

      await axios.patch(`${API_URL}/api/student/submission/grade/${submissionId}`, gradePayload);

      // Show success and redirect
      navigate('/teacher/submissions', {
        state: { message: 'Submission graded successfully!' }
      });

    } catch (error) {
      console.error('Error grading submission:', error);
      setError(error.response?.data?.message || 'Failed to grade submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculatePercentage = () => {
    if (gradeData.maxScore === 0) return 0;
    return ((gradeData.score / gradeData.maxScore) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="grade-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="grade-page">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Submission</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/teacher/submissions')} className="btn-primary">
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }
  // Helper function to get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return 'fa-file';

    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'fa-file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('video')) return 'fa-file-video';
    if (fileType.includes('audio')) return 'fa-file-audio';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return 'fa-file-archive';
    if (fileType.includes('text')) return 'fa-file-alt';

    return 'fa-file';
  };

  return (
    <div className="grade-page">
      <div className="grade-container">
        {/* Header */}
        <div className="grade-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <h1>Grade File Submission</h1>
          <div className="header-actions">
            {submission?.status === 'graded' && (
              <span className="graded-badge">
                <i className="fas fa-check-circle"></i>
                Already Graded
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grade-content">
          {/* Submission Info Card */}
          <div className="info-card">
            <h2>
              <i className="fas fa-file-alt"></i>
              Submission Information
            </h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Student ID</label>
                <p>{submission?.studentId}</p>
              </div>
              <div className="info-item">
                <label>Assignment ID</label>
                <p>{submission?.assignmentId}</p>
              </div>
              <div className="info-item">
                <label>Submitted At</label>
                <p>{formatDate(submission?.submittedAt)}</p>
              </div>
              <div className="info-item">
                <label>Submission Type</label>
                <p className="type-badge file">
                  <i className="fas fa-file-upload"></i>
                  File Upload
                </p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p className={`status-badge ${submission?.status}`}>
                  {submission?.status === 'graded' ? '✓ Graded' : '⏳ Pending'}
                </p>
              </div>
              <div className="info-item">
                <label>Late Submission</label>
                <p>{submission?.isLate ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Assignment Info Card */}
          {assignment && (
            <div className="info-card">
              <h2>
                <i className="fas fa-tasks"></i>
                Assignment Details
              </h2>
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Title</label>
                  <p className="assignment-title">{assignment.title}</p>
                </div>
                <div className="info-item">
                  <label>Total Points</label>
                  <p className="total-points">{assignment.totalPoints} pts</p>
                </div>
                <div className="info-item">
                  <label>Deadline</label>
                  <p>{formatDate(assignment.deadLine)}</p>
                </div>
                {assignment.description && (
                  <div className="info-item full-width">
                    <label>Description</label>
                    <p className="description">{assignment.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* File Preview Card */}
          <div className="info-card">
            <h2>
              <i className="fas fa-paperclip"></i>
              Submitted Files
            </h2>


            {submission?.attachments && submission.attachments.length > 0 ? (
              <div className="files-list">
                {submission.attachments.map((file, index) => (
                  <div key={index} className="file-item">
                    <i className={`fas ${getFileIcon(file.fileType)}`}></i>
                    <div className="file-info">
                      <span className="file-name">{file.fileName || `File ${index + 1}`}</span>
                      <span className="file-size">{file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : ''}</span>
                      <span className="file-type">{file.fileType?.split('/').pop() || 'Unknown'}</span>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download"
                      download={file.fileName}
                    >
                      <i className="fas fa-download"></i>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-files">
                <i className="fas fa-folder-open"></i>
                <p>No files attached to this submission</p>
              </div>
            )}
          </div>

          {/* Grading Card */}
          <div className="grading-card">
            <h2>
              <i className="fas fa-edit"></i>
              Grade Submission
            </h2>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
                <button onClick={() => setError(null)} className="close-error">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <div className="grading-form">
              <div className="score-section">
                <label>Score</label>
                <div className="score-input-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    value={gradeData.score}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    className="score-input"
                    disabled={submitting}
                  />
                  <span className="score-divider">/</span>
                  <span className="max-score">{gradeData.maxScore} points</span>
                </div>
                <div className="score-preview">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${calculatePercentage()}%` }}
                    ></div>
                  </div>
                  <span className="percentage">{calculatePercentage()}%</span>
                </div>
              </div>

              <div className="feedback-section">
                <label>Feedback</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={handleFeedbackChange}
                  placeholder="Provide detailed feedback to the student..."
                  rows="6"
                  className="feedback-input"
                  disabled={submitting}
                ></textarea>
                <div className="feedback-hint">
                  <i className="fas fa-lightbulb"></i>
                  <span>Tips: Mention what was done well, what needs improvement, and suggestions for future work.</span>
                </div>
              </div>

              <div className="grading-actions">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/submissions')}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitGrade}
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {submission?.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Rubric Card (Optional) */}
          {assignment?.rubric && assignment.rubric.length > 0 && (
            <div className="info-card">
              <h2>
                <i className="fas fa-list-check"></i>
                Grading Rubric
              </h2>
              <div className="rubric-list">
                {assignment.rubric.map((criterion, index) => (
                  <div key={index} className="rubric-item">
                    <div className="rubric-header">
                      <span className="rubric-name">{criterion.name}</span>
                      <span className="rubric-points">{criterion.points} pts</span>
                    </div>
                    <p className="rubric-description">{criterion.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeFileSubmission;