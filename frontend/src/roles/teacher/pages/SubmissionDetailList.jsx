import { useNavigate } from 'react-router';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaLaptop,
  FaRedoAlt,
  FaRegCalendarAlt,
  FaStar,
} from 'react-icons/fa';

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

const formatTime = (seconds) => {
  if (seconds === undefined || seconds === null) return 'Not available';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const SubmissionDetailList = ({ data }) => {
  const navigate = useNavigate();
  const submissions = Array.isArray(data) ? data : (data?.submission || data?.submissions || []);

  return (
    <main className="submission-detail-page">
      <button className="submission-back" type="button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to submissions
      </button>

      <header className="submission-detail-heading">
        <div>
          <span className="submission-eyebrow">Submission review</span>
          <h1>Submission details</h1>
          <p>Review the result, timing, and grading information in one place.</p>
        </div>
        <span className="submission-count">{submissions.length} record{submissions.length === 1 ? '' : 's'}</span>
      </header>

      {submissions.length === 0 ? (
        <section className="submission-empty">
          <FaFileAlt />
          <h2>No submission found</h2>
          <p>This submission may have been removed or is no longer available.</p>
        </section>
      ) : submissions.map((submission) => {
        const onlineScore = submission.onlineSubmission?.score;
        const earned = onlineScore?.earned ?? submission.grade?.score ?? 0;
        const total = onlineScore?.total;
        const rawPercentage = onlineScore?.percentage ?? (total ? (earned / total) * 100 : 0);
        const percentage = Number.isFinite(Number(rawPercentage)) ? Number(rawPercentage) : 0;
        const status = submission.status || 'pending';

        return (
          <article className="submission-detail-card" key={submission._id}>
            <div className="submission-card-top">
              <div className={`submission-type-icon ${submission.submissionType || 'paper'}`}>
                {submission.submissionType === 'online' ? <FaLaptop /> : <FaFileAlt />}
              </div>
              <div className="submission-title-copy">
                <span>{submission.submissionType || 'Submission'}</span>
                <h2>{submission.assignmentId?.title || 'Untitled assignment'}</h2>
              </div>
              <span className={`submission-status ${status}`}><FaCheckCircle /> {status}</span>
            </div>

            <div className="submission-card-body">
              <section className="submission-score-panel">
                <div className="submission-score-ring" style={{ '--score': `${Math.min(100, Math.max(0, percentage)) * 3.6}deg` }}>
                  <div><strong>{percentage.toFixed(2)}%</strong><span>Final score</span></div>
                </div>
                <div className="submission-score-copy">
                  <span>Points earned</span>
                  <strong>{earned}{total !== undefined ? ` / ${total}` : ' points'}</strong>
                  <div className="submission-progress"><span style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} /></div>
                </div>
              </section>

              <section className="submission-facts">
                <div><span className="fact-icon"><FaRegCalendarAlt /></span><p>Submitted</p><strong>{formatDate(submission.submittedAt)}</strong></div>
                <div><span className="fact-icon"><FaClock /></span><p>Time spent</p><strong>{formatTime(submission.onlineSubmission?.timeSpent)}</strong></div>
                <div><span className="fact-icon"><FaRedoAlt /></span><p>Attempts</p><strong>{submission.onlineSubmission?.attemptsCount ?? 'Not available'}</strong></div>
                <div><span className="fact-icon"><FaStar /></span><p>Graded at</p><strong>{formatDate(submission.grade?.gradedAt)}</strong></div>
              </section>
            </div>

            {submission.grade?.feedback && (
              <section className="submission-feedback">
                <span>Teacher feedback</span>
                <p>{submission.grade.feedback}</p>
              </section>
            )}
          </article>
        );
      })}
    </main>
  );
};

export default SubmissionDetailList;
