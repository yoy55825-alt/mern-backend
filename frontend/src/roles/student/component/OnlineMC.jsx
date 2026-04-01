import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { UserContext } from '../../../context/userContext';
import './OnlineSubmit.css';

const OnlineSubmit = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [assignment, setAssignment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [startTime] = useState(new Date());
    const [timeSpent, setTimeSpent] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Fetch assignment data
    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    // Timer for tracking time spent
    useEffect(() => {
        const timer = setInterval(() => {
            if (!submitted) {
                const elapsed = Math.floor((new Date() - startTime) / 1000);
                setTimeSpent(elapsed);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, submitted]);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/student/assignment/detail/${assignmentId}`);
            setAssignment(response?.data.data || []);

            // Initialize answers object
            const initialAnswers = {};
            response.data.data.questions.forEach(question => {
                initialAnswers[question._id] = null;
            });
            setAnswers(initialAnswers);

        } catch (error) {
            console.error('Error fetching assignment:', error);
            setError('Failed to load assignment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const validateAnswers = () => {
        const unanswered = assignment.questions.filter(q =>
            answers[q._id] === null || answers[q._id] === undefined || answers[q._id] === ''
        );

        if (unanswered.length > 0) {
            setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateAnswers()) return;

        try {
            setSubmitting(true);
            setError(null);

            // Prepare answers array
            const answersArray = Object.keys(answers).map(questionId => ({
                questionId,
                answer: answers[questionId]
            }));

            const response = await axios.post(`${API_URL}/api/student/submission/online/${assignmentId}`, {
                answers: answersArray,
                timeSpent,
                studentId: user.id
            });

            setSubmissionResult(response?.data.data || []);
            setSubmitted(true);

        } catch (error) {
            console.error('Error submitting assignment:', error);
            setError(error.response?.data?.message || 'Failed to submit assignment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="online-submit-container">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading assignment...</p>
                </div>
            </div>
        );
    }

    if (error && !assignment) {
        return (
            <div className="online-submit-container">
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error}</p>
                    <button onClick={() => navigate('/student/assignmentList')} className="btn-primary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (submitted && submissionResult) {
        return (
            <div className="online-submit-container">
                <div className="submission-success">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h2>Assignment Submitted Successfully!</h2>

                    <div className="result-card">
                        <div className="result-header">
                            <h3>{assignment.title}</h3>
                            <span className={`status-badge ${submissionResult.status}`}>
                                {submissionResult.status}
                            </span>
                        </div>

                        <div className="score-section">
                            <div className="score-circle">
                                <span className="score-percentage">{Math.round(submissionResult.percentage)}%</span>
                                <span className="score-points">
                                    {submissionResult.score}/{submissionResult.totalPoints} points
                                </span>
                            </div>
                        </div>

                        <div className="result-details">
                            <div className="detail-item">
                                <i className="fas fa-clock"></i>
                                <span>Time spent: {formatTime(timeSpent)}</span>
                            </div>
                            <div className="detail-item">
                                <i className="fas fa-calendar"></i>
                                <span>Submitted: {new Date().toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <i className="fas fa-chart-line"></i>
                                <span>Attempts: {submissionResult.attemptsCount}</span>
                            </div>
                        </div>

                        <div className="answers-review">
                            <h4>Question Review</h4>
                            {assignment.questions.map((question, index) => {
                                const result = submissionResult.answers.find(a => a.questionId === question._id);
                                return (
                                    <div key={question._id} className={`review-item ${result?.isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="review-question">
                                            <span className="question-number">{index + 1}.</span>
                                            <span className="question-text">{question.questionText}</span>
                                            <span className="question-points">{question.points} pts</span>
                                        </div>
                                        <div className="review-answer">
                                            <i className={`fas ${result?.isCorrect ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                            <span>Your answer: {answers[question._id]}</span>
                                            {!result?.isCorrect && question.correctAnswer && (
                                                <span className="correct-answer">Correct answer: {question.correctAnswer}</span>
                                            )}
                                            <span className="earned-points">{result?.pointsEarned}/{question.points} pts</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="action-buttons">
                            <button onClick={() => navigate('/student/dashboard')} className="btn-secondary">
                                Back to Dashboard
                            </button>
                            <button onClick={() => window.location.reload()} className="btn-primary">
                                View All Submissions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="online-submit-container">
            <div className="assignment-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <i className="fas fa-arrow-left"></i> Back
                </button>
                <div className="timer">
                    <i className="fas fa-hourglass-half"></i>
                    <span>Time: {formatTime(timeSpent)}</span>
                </div>
            </div>

            <div className="assignment-info">
                <h1>{assignment.title}</h1>
                <p className="description">{assignment.description}</p>
                <div className="info-grid">
                    <div className="info-item">
                        <i className="fas fa-star"></i>
                        <span>Total Points: {assignment.totalPoints}</span>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Deadline: {formatDate(assignment.deadLine)}</span>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-question-circle"></i>
                        <span>Questions: {assignment.questions?.length}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-alert">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="close-error">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            <div className="questions-container">
                {assignment.questions?.map((question, index) => (
                    <div key={question._id} className="question-card">
                        <div className="question-header">
                            <div className="question-number">Question {index + 1}</div>
                            <div className="question-points">{question.points} point(s)</div>
                        </div>

                        <div className="question-text">
                            {question.questionText}
                            {question.required && <span className="required-badge">Required</span>}
                        </div>

                        {/* Multiple Choice Questions */}
                        {question.questionType === 'multiple_choice' && (
                            <div className="multiple-choice-options">
                                {question.options?.map((option, optIndex) => (
                                    <label
                                        key={optIndex}
                                        className={`
                                                    flex items-center p-3 mb-2 rounded-lg border cursor-pointer
                                                    transition-all duration-200
                                                    ${answers[question._id] === option.optionText
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}>
                                        <input
                                            type="radio"
                                            name={`question_${question._id}`}
                                            value={option.optionText}
                                            checked={answers[question._id] === option.optionText}
                                            onChange={() => handleAnswerChange(question._id, option.optionText)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
                                        />
                                        <span className="font-medium text-gray-800">
                                            {String.fromCharCode(65 + optIndex)}. {option.optionText}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* True/False Questions */}
                        {/* {question.questionType === 'true_false' && (
                            <div className="true-false-options">
                                <label className={`radio-option ${answers[question._id] === 'True' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name={`question_${question._id}`}
                                        value="True"
                                        checked={answers[question._id] === 'True'}
                                        onChange={() => handleAnswerChange(question._id, 'True')}
                                        disabled={submitting}
                                    />
                                    <span className="option-text">
                                        <i className="fas fa-check-circle"></i>
                                        True
                                    </span>
                                </label>

                                <label className={`radio-option ${answers[question._id] === 'False' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name={`question_${question._id}`}
                                        value="False"
                                        checked={answers[question._id] === 'False'}
                                        onChange={() => handleAnswerChange(question._id, 'False')}
                                        disabled={submitting}
                                    />
                                    <span className="option-text">
                                        <i className="fas fa-times-circle"></i>
                                        False
                                    </span>
                                </label>
                            </div>
                        )} */}

                        {question.hint && (
                            <div className="hint">
                                <i className="fas fa-lightbulb"></i>
                                <span>Hint: {question.hint}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="submission-footer">
                <div className="progress-summary">
                    <span>Answered: {Object.values(answers).filter(a => a !== null).length}/{assignment.questions?.length}</span>
                    {/* <span>Time remaining: {formatTime(Math.max(0, (new Date(assignment.deadLine) - new Date()) / 1000))}</span> */}
                </div>

                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={submitting || Object.values(answers).filter(a => a !== null).length !== assignment.questions?.length}
                >
                    {submitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-paper-plane"></i>
                            Submit Assignment
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default OnlineSubmit;