import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { UserContext } from '../../../context/userContext';
import './OnlineSubmit.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MANUAL_TYPES = new Set(['short_note', 'essay']);

const TYPE_LABELS = {
  true_false: 'True or false',
  multiple_choice: 'Multiple choice',
  fill_blank: 'Fill in the blank',
  short_note: 'Short answer',
  essay: 'Essay',
};

const isAnswered = (value) => (
  value !== null && value !== undefined && (typeof value !== 'string' || value.trim() !== '')
);

const formatDate = (value) => {
  if (!value) return 'No deadline';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'No deadline'
    : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const getOptionValue = (option) => option?.optionId || option?.optionText || '';

const AnswerControl = ({ question, value, onChange, disabled }) => {
  if (question.questionType === 'true_false') {
    return (
      <div className="oas-choice-grid oas-choice-grid--binary">
        {[true, false].map((option) => (
          <label className={`oas-choice ${value === option ? 'is-selected' : ''}`} key={String(option)}>
            <input
              type="radio"
              name={`question_${question._id}`}
              checked={value === option}
              onChange={() => onChange(option)}
              disabled={disabled}
            />
            <span className="oas-choice-marker">{value === option ? <Check size={16} /> : null}</span>
            <span>{option ? 'True' : 'False'}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.questionType === 'multiple_choice') {
    return (
      <div className="oas-choice-grid">
        {(question.options || []).map((option, index) => {
          const optionValue = getOptionValue(option);
          return (
            <label
              className={`oas-choice ${value === optionValue ? 'is-selected' : ''}`}
              key={option._id || optionValue || index}
            >
              <input
                type="radio"
                name={`question_${question._id}`}
                checked={value === optionValue}
                onChange={() => onChange(optionValue)}
                disabled={disabled}
              />
              <span className="oas-choice-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option.optionText}</span>
              <span className="oas-choice-check">{value === optionValue ? <Check size={16} /> : null}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.questionType === 'fill_blank') {
    return (
      <input
        className="oas-written-input"
        type="text"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your answer"
        disabled={disabled}
        autoComplete="off"
      />
    );
  }

  if (MANUAL_TYPES.has(question.questionType)) {
    const wordCount = String(value || '').trim().split(/\s+/).filter(Boolean).length;
    return (
      <div>
        <textarea
          className="oas-written-input oas-written-input--area"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question.questionType === 'essay' ? 'Write your essay here…' : 'Write your answer here…'}
          rows={question.questionType === 'essay' ? 9 : 5}
          disabled={disabled}
        />
        <div className="oas-word-count">
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          {question.wordLimit ? <span>Suggested limit: {question.wordLimit} words</span> : null}
        </div>
      </div>
    );
  }

  return <p className="oas-unsupported">This question type is not supported yet.</p>;
};

const displayAnswer = (question, answer) => {
  if (question.questionType === 'true_false') return answer === true ? 'True' : answer === false ? 'False' : 'No answer';
  if (question.questionType === 'multiple_choice') {
    return question.options?.find((option) => getOptionValue(option) === answer)?.optionText || answer || 'No answer';
  }
  return answer || 'No answer';
};

const ResultScreen = ({ assignment, answers, result, onBack }) => {
  const awaitingReview = assignment.questions.some((question) => MANUAL_TYPES.has(question.questionType));
  const resultAnswers = Array.isArray(result.answers) ? result.answers : [];
  const percentage = Number(result.percentage) || 0;

  return (
    <main className="oas-assessment-page">
      <section className="oas-result-hero">
        <div className="oas-success-mark"><CheckCircle2 size={32} /></div>
        <p className="oas-eyebrow">Submission received</p>
        <h1>{awaitingReview ? 'Your work is with your teacher' : 'Nice work — you’re all done'}</h1>
        <p>{awaitingReview ? 'Objective questions are scored now. Written responses will be reviewed separately.' : 'Your answers have been saved and graded.'}</p>
      </section>

      <section className="oas-result-card">
        <div className="oas-result-summary">
          <div>
            <span className="oas-muted-label">Assignment</span>
            <h2>{assignment.title}</h2>
            <span className={`oas-status ${result.status === 'graded' ? 'is-graded' : ''}`}>
              {result.status === 'graded' ? 'Graded' : 'Awaiting review'}
            </span>
          </div>
          <div className="oas-score" style={{ '--score': `${Math.min(100, Math.max(0, percentage)) * 3.6}deg` }}>
            <div><strong>{Math.round(percentage)}%</strong><span>{result.score ?? 0}/{result.totalPoints ?? assignment.totalPoints ?? 0} pts</span></div>
          </div>
        </div>

        <div className="oas-result-facts">
          <span><RotateCcw size={17} /> Attempt <strong>{result.attemptsCount || 1}</strong></span>
          <span><FileText size={17} /> Questions <strong>{assignment.questions.length}</strong></span>
        </div>

        <div className="oas-review-list">
          <div className="oas-section-heading"><div><p className="oas-eyebrow">Review</p><h2>Your answers</h2></div></div>
          {assignment.questions.map((question, index) => {
            const answerResult = resultAnswers.find((item) => String(item.questionId) === String(question._id));
            const manual = MANUAL_TYPES.has(question.questionType);
            const state = manual ? 'manual' : answerResult?.isCorrect ? 'correct' : 'incorrect';
            return (
              <article className={`oas-review-item is-${state}`} key={question._id}>
                <div className="oas-review-number">{index + 1}</div>
                <div className="oas-review-content">
                  <div className="oas-review-title"><strong>{question.questionText}</strong><span>{question.points || 0} pts</span></div>
                  <p>Your answer: <strong>{displayAnswer(question, answers[question._id])}</strong></p>
                  <span className="oas-review-state">
                    {manual ? 'Pending teacher review' : answerResult?.isCorrect ? `Correct · ${answerResult.pointsEarned || 0} pts` : 'Not correct · 0 pts'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <button className="oas-primary-button oas-result-button" type="button" onClick={onBack}>Back to assignments</button>
      </section>
    </main>
  );
};

const OnlineSubmit = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const loadAssignment = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/student/assignment/detail/${assignmentId}`);
      const data = response?.data?.data;
      if (!data || !Array.isArray(data.questions)) throw new Error('Invalid assignment data');
      setAssignment(data);
      setAnswers(Object.fromEntries(data.questions.map((question) => [question._id, null])));
    } catch (requestError) {
      console.error('Error fetching assignment:', requestError);
      setError(requestError.response?.data?.message || 'We could not load this assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => { loadAssignment(); }, [loadAssignment]);

  const questionCount = assignment?.questions?.length || 0;
  const answeredCount = useMemo(() => Object.values(answers).filter(isAnswered).length, [answers]);
  const remainingCount = Math.max(0, questionCount - answeredCount);
  const progress = questionCount ? Math.round((answeredCount / questionCount) * 100) : 0;

  const updateAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setError('');
  };

  const requestSubmit = () => {
    if (remainingCount) {
      setError(`Please answer ${remainingCount} remaining ${remainingCount === 1 ? 'question' : 'questions'} before submitting.`);
      document.querySelector('.oas-question-card:not(.is-answered)')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setConfirming(true);
  };

  const submitAssignment = async () => {
    if (!user?.id) {
      setError('Your student session is missing. Please sign in again.');
      setConfirming(false);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/student/submission/online/${assignmentId}`, {
        answers: assignment.questions.map((question) => ({ questionId: question._id, answer: answers[question._id] })),
        studentId: user.id,
      });
      if (!response?.data?.data) throw new Error('Missing submission result');
      setResult(response.data.data);
      setConfirming(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      console.error('Error submitting assignment:', requestError);
      setError(requestError.response?.data?.message || 'Your submission could not be saved. Please try again.');
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="oas-assessment-page oas-centered"><LoaderCircle className="oas-spin" size={34} /><h2>Opening your assignment</h2><p>Getting the questions ready…</p></main>;
  }

  if (!assignment) {
    return (
      <main className="oas-assessment-page oas-centered">
        <div className="oas-error-mark"><AlertCircle size={28} /></div><h2>Assignment unavailable</h2><p>{error}</p>
        <div className="oas-error-actions"><button className="oas-secondary-button" onClick={() => navigate('/student/assignmentList')}>Back to assignments</button><button className="oas-primary-button" onClick={loadAssignment}>Try again</button></div>
      </main>
    );
  }

  if (result) return <ResultScreen assignment={assignment} answers={answers} result={result} onBack={() => navigate('/student/assignmentList')} />;

  return (
    <main className="oas-assessment-page">
      <header className="oas-assessment-topbar">
        <button className="oas-back-button" type="button" onClick={() => navigate('/student/assignmentList')}><ArrowLeft size={18} /> Assignments</button>
        <span className="oas-workspace-label">Student workspace</span>
      </header>

      <section className="oas-assignment-hero">
        <div className="oas-assignment-copy">
          <p className="oas-eyebrow"><Sparkles size={14} /> Assessment workspace</p>
          <h1>{assignment.title}</h1>
          <p>{assignment.description || 'Complete every question, then review and submit your answers.'}</p>
        </div>
        <div className="oas-meta-grid">
          <div><span>Questions</span><strong>{questionCount}</strong></div>
          <div><span>Total points</span><strong>{assignment.totalPoints || 0}</strong></div>
          <div className="oas-meta-wide"><span>Due</span><strong>{formatDate(assignment.deadLine)}</strong></div>
        </div>
      </section>

      <section className="oas-progress-card" aria-label="Assignment progress">
        <div><strong>{progress}% complete</strong><span>{remainingCount ? `${remainingCount} ${remainingCount === 1 ? 'question' : 'questions'} left` : 'Ready to submit'}</span></div>
        <div className="oas-progress-track"><span style={{ width: `${progress}%` }} /></div>
      </section>

      {error ? <div className="oas-alert" role="alert"><AlertCircle size={19} /><span>{error}</span><button aria-label="Dismiss message" onClick={() => setError('')}><X size={18} /></button></div> : null}

      <section className="oas-questions-list">
        {assignment.questions.map((question, index) => {
          const answered = isAnswered(answers[question._id]);
          return (
            <article className={`oas-question-card ${answered ? 'is-answered' : ''}`} key={question._id}>
              <div className="oas-question-head">
                <span className="oas-question-index">{answered ? <Check size={16} /> : index + 1}</span>
                <div><span className="oas-question-type">{TYPE_LABELS[question.questionType] || question.questionType}</span><span className="oas-point-pill">{question.points || 0} {question.points === 1 ? 'point' : 'points'}</span></div>
              </div>
              <h2>{question.questionText}</h2>
              <AnswerControl question={question} value={answers[question._id]} onChange={(value) => updateAnswer(question._id, value)} disabled={submitting} />
              {question.hint ? <div className="oas-hint"><Lightbulb size={17} /><span><strong>Hint</strong>{question.hint}</span></div> : null}
            </article>
          );
        })}
      </section>

      <footer className="oas-submit-bar">
        <div className="oas-submit-inner"><div><strong>{answeredCount} of {questionCount} answered</strong><span>{remainingCount ? 'Complete every question to continue' : 'Everything looks ready'}</span></div><button className="oas-primary-button" type="button" onClick={requestSubmit} disabled={submitting}><Send size={17} /> Review & submit</button></div>
      </footer>

      {confirming ? (
        <div className="oas-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setConfirming(false); }}>
          <section className="oas-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="submit-title">
            <div className="oas-confirm-icon"><Send size={23} /></div><p className="oas-eyebrow">Final check</p><h2 id="submit-title">Submit this assignment?</h2><p>You answered all {questionCount} questions. You can resubmit later, but this attempt will be saved.</p>
            <div className="oas-confirm-stats"><span><CheckCircle2 size={16} /> {answeredCount} questions answered</span></div>
            <div className="oas-modal-actions"><button className="oas-secondary-button" onClick={() => setConfirming(false)} disabled={submitting}>Keep reviewing</button><button className="oas-primary-button" onClick={submitAssignment} disabled={submitting}>{submitting ? <><LoaderCircle className="oas-spin" size={17} /> Submitting…</> : <><Send size={17} /> Submit now</>}</button></div>
          </section>
        </div>
      ) : null}
    </main>
  );
};

export default OnlineSubmit;
