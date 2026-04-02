import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../../context/userContext'; // Adjust path as needed
import './FileSubmit.css';

const FileUpload = () => {
    const { assignmentId } = useParams();
    console.log(assignmentId);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [assignment, setAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);
    // const [existingSubmission, setExistingSubmission] = useState(null);

    // Fetch assignment details on component mount
    useEffect(() => {
        fetchAssignmentDetails();
        // checkExistingSubmission();

    }, []);

    const fetchAssignmentDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/student/assignment/detail/${assignmentId}`);
            setAssignment(response?.data.data || []);
            console.log(response);


            setError('');
        } catch (err) {
            console.error('Error fetching assignment:', err);
            setError('Failed to load assignment details');
        } finally {
            setLoading(false);
        }
    };

    // const checkExistingSubmission = async () => {
    //     try {
    //         const response = await axios.get(`http://localhost:3000/api/student/assignment/fileUpload/${assignmentId}`, {
    //             headers: {
    //                 Authorization: `Bearer ${localStorage.getItem('token')}`
    //             }
    //         });
    //         if (response.data.data) {
    //             setExistingSubmission(response.data.data);
    //         }
    //     } catch (err) {
    //         // No existing submission found, that's fine
    //         console.log('No existing submission');
    //     }
    // };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        setError('');

        if (!selectedFile) return;

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
            setError('File size must be less than 10MB');
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload PDF, DOC, DOCX, JPEG, or PNG files only.');
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }
        console.log(file);
        

        setSubmitting(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('attachments', file);
        formData.append('studentId',user.id)

        try {
            const response = await axios.post(
                `${API_URL}/api/student/assignment/fileUpload/${assignmentId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.status==200) {
                setSuccess('File submitted successfully!');
                setFile(null);
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';

                setTimeout(() => {
                    navigate('/student/assignmentList');
                }, 2000);
            }
        } catch (err) {
            console.error('Error submitting file:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to submit file. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysLeft = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="file-upload-container">
                <div className="loading-spinner"></div>
                <p>Loading assignment details...</p>
            </div>
        );
    }

    if (error && !assignment) {
        return (
            <div className="file-upload-container">
                <div className="error-card">
                    <i className="fas fa-exclamation-circle"></i>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/student/assignments')} className="back-button">
                        Back to Assignments
                    </button>
                </div>
            </div>
        );
    }
    console.log(assignment);

    const isDeadlinePassed = assignment && new Date(assignment.deadLine) < new Date();
    const daysLeft = assignment ? getDaysLeft(assignment.deadLine) : 0;

    return (
        <div className="file-upload-container">
            <div className="upload-wrapper">
                {/* Header */}
                <div className="upload-header">
                    <button onClick={() => navigate('/student/assignments')} className="back-btn">
                        <i className="fas fa-arrow-left"></i> Back to Assignments
                    </button>
                    <h1>File Submission</h1>
                </div>

                {/* Assignment Info Card */}
                {assignment && (
                    <div className="assignment-info-card">
                        <div className="card-header">
                            <h2>{assignment.title}</h2>
                            <span className={`status-badge ${assignment.status === 'active' && !isDeadlinePassed ? 'active' : 'closed'}`}>
                                {assignment.status === 'active' && !isDeadlinePassed ? 'Active' : 'Closed'}
                            </span>
                        </div>

                        <p className="description">{assignment.description}</p>

                        <div className="info-grid">
                            <div className="info-item">
                                <i className="fas fa-chalkboard-user"></i>
                                <div>
                                    <label>Teacher</label>
                                    <span>{assignment.teacherName}</span>
                                </div>
                            </div>


                            <div className="info-item">
                                <i className="fas fa-calendar-alt"></i>
                                <div>
                                    <label>Deadline</label>
                                    <span>{formatDate(assignment.deadLine)}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <i className="fas fa-hourglass-half"></i>
                                <div>
                                    <label>Time Remaining</label>
                                    <span className={daysLeft <= 3 ? 'urgent' : ''}>
                                        {isDeadlinePassed ? (
                                            'Deadline passed'
                                        ) : daysLeft === 0 ? (
                                            'Due today!'
                                        ) : (
                                            `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isDeadlinePassed && (
                            <div className="deadline-warning">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>This assignment deadline has passed. Late submissions may not be accepted.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Existing Submission Warning
                {existingSubmission && (
                    <div className="existing-submission-warning">
                        <i className="fas fa-info-circle"></i>
                        <div>
                            <strong>Previous submission found</strong>
                            <p>You have already submitted a file for this assignment. Submitting again will replace your previous submission.</p>
                        </div>
                    </div>
                )} */}

                {/* Upload Form */}
                {assignment && assignment.status === 'active' && !isDeadlinePassed ? (
                    <form onSubmit={handleSubmit} className="upload-form">
                        <div
                            className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'file-selected' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                style={{ display: 'none' }}
                            />

                            {file ? (
                                <div className="file-preview">
                                    <i className="fas fa-file-alt"></i>
                                    <div className="file-info">
                                        <p className="file-name">{file.name}</p>
                                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-file"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            document.getElementById('file-upload').value = '';
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <i className="fas fa-cloud-upload-alt upload-icon"></i>
                                    <p className="drag-text">Drag & drop your file here</p>
                                    <p className="or-text">or</p>
                                    <button type="button" className="browse-btn">
                                        Browse Files
                                    </button>
                                    <p className="file-hint">
                                        Supported formats: PDF, DOC, DOCX, JPEG, PNG (Max 10MB)
                                    </p>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="success-message">
                                <i className="fas fa-check-circle"></i>
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/student/assignments')}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!file || submitting}
                            >
                                {submitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-upload"></i>
                                        Submit Assignment
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="submission-closed-card">
                        <i className="fas fa-lock"></i>
                        <h3>Submission Closed</h3>
                        <p>
                            {assignment?.status !== 'active'
                                ? 'This assignment is no longer accepting submissions.'
                                : 'The deadline for this assignment has passed.'}
                        </p>
                        <button onClick={() => navigate('/student/assignments')} className="back-button">
                            Back to Assignments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;