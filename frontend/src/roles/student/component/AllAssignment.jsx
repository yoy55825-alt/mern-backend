import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../../context/userContext';
import { useNavigate } from 'react-router';

// ── icons ──────────────────────────────────────────────────────────────────
const Icon = {
  Laptop: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  File: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Question: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Teacher: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Inbox: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
};

// ── helpers ────────────────────────────────────────────────────────────────
const getDaysLeft = (deadline) => {
  const diffTime = new Date(deadline) - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDeadline = (deadline) =>
  new Date(deadline).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const getSubmissionTypeConfig = (type) => {
  switch (type) {
    case 'online': return { label: 'Online Quiz', Icon: Icon.Laptop, classes: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20' };
    case 'file':   return { label: 'File Upload', Icon: Icon.Upload, classes: 'bg-sky-500/10 text-sky-400 ring-sky-500/20' };
    case 'paper':  return { label: 'Paper Submission', Icon: Icon.File, classes: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' };
    default:       return { label: 'Read Only', Icon: Icon.Eye, classes: 'bg-slate-500/10 text-slate-400 ring-slate-500/20' };
  }
};

const getUrgencyConfig = (daysLeft, isPast, status) => {
  if (status === 'closed' || isPast)
    return { label: 'Closed', classes: 'bg-red-500/10 text-red-400 ring-red-500/20', bar: 'bg-red-500' };
  if (daysLeft <= 3)
    return { label: `${daysLeft}d left`, classes: 'bg-orange-500/10 text-orange-400 ring-orange-500/20', bar: 'bg-orange-500' };
  if (daysLeft <= 7)
    return { label: `${daysLeft}d left`, classes: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20', bar: 'bg-yellow-500' };
  return { label: `${daysLeft}d left`, classes: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', bar: 'bg-emerald-500' };
};

const getSubmissionStatusConfig = (status) => {
  switch (status) {
    case 'submitted': return { label: 'Submitted', Icon: Icon.Check, classes: 'bg-emerald-500/10 text-emerald-400' };
    case 'graded':    return { label: 'Graded', Icon: Icon.Star, classes: 'bg-indigo-500/10 text-indigo-400' };
    case 'late':      return { label: 'Late Submission', Icon: Icon.Clock, classes: 'bg-amber-500/10 text-amber-400' };
    default:          return null;
  }
};

// ── main component ─────────────────────────────────────────────────────────
const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => { fetchAssignments(); }, []);
  useEffect(() => {
    if (assignments.length > 0 && user) filterAssignmentsByUser();
  }, [assignments, user]);
  useEffect(() => {
    if (user && filteredAssignments.length > 0) fetchUserSubmissions();
  }, [user, filteredAssignments]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/student/assignment/fetchAll`);
      setAssignments(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      const responses = await Promise.all(
        filteredAssignments.map(a =>
          axios.get(`${API_URL}/api/student/submission/fetchSingle/${a._id}`, {
            params: { studentId: user.id },
          }).catch(err => err.response?.status === 404 ? { data: null } : { data: null })
        )
      );
      const map = {};
      responses.forEach((res, i) => {
        const id = filteredAssignments[i]._id;
        const sub = res.data?.data;
        map[id] = sub
          ? { status: sub.status, submissionId: sub._id, submittedAt: sub.submittedAt }
          : { status: 'pending', submissionId: null };
      });
      setSubmissionsMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  const filterAssignmentsByUser = () => {
    if (!user) return setFilteredAssignments([]);
    const { year, major, semester } = user;
    setFilteredAssignments(
      assignments.filter(a => {
        if (!a.targetYear && !a.targetMajor && !a.targetSemester) return true;
        return a.targetYear === year && a.targetMajor === major && a.targetSemester === semester;
      })
    );
  };

  const getButtonConfig = (assignmentId, submissionType, assignmentStatus, deadline) => {
    const subStatus = submissionsMap[assignmentId]?.status;
    const isPast = new Date(deadline) < new Date();

    if (subStatus === 'submitted') return { show: false, label: 'Submitted' };
    if (subStatus === 'graded')    return { show: false, label: 'Graded' };
    if (subStatus === 'absent')    return { show: false, label: 'Absent' };
    if (subStatus === 'late')      return { show: true, late: true, label: submissionType === 'online' ? 'Submit Late' : 'Upload Late' };
    if (assignmentStatus === 'closed' || isPast) return { show: false, label: 'Closed' };
    if (submissionType === 'none' || submissionType === 'paper') return { show: false, label: submissionType === 'paper' ? 'Paper Submission' : 'No Submission' };

    return {
      show: true,
      label: submissionType === 'online' ? 'Start Quiz' : 'Upload File',
      Icon: submissionType === 'online' ? Icon.Laptop : Icon.Upload,
    };
  };

  const handleSubmit = (assignmentId, submissionType) => {
    const subStatus = submissionsMap[assignmentId]?.status;
    if (subStatus === 'submitted' || subStatus === 'graded') return;
    if (submissionType === 'online') {
      navigate('/student/online/' + assignmentId);
    } else if (submissionType === 'file') {
      navigate('/student/fileUpload/' + assignmentId);
    }
  };

  // ── loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading assignments…</p>
        </div>
      </div>
    );
  }

  // ── empty state ────────────────────────────────────────────────────────
  if (filteredAssignments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950">
        <PageHeader user={user} count={0} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="text-slate-600 mb-4"><Icon.Inbox /></div>
          <h3 className="text-lg font-medium text-slate-300 mb-1">No assignments yet</h3>
          <p className="text-sm text-slate-500">
            Nothing matches Year {user?.year} · {user?.major} · {user?.semester === 'first' ? 'First' : 'Second'} Semester
          </p>
        </div>
      </div>
    );
  }

  // ── main render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">
      <PageHeader user={user} count={filteredAssignments.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAssignments.map(assignment => {
            const daysLeft = getDaysLeft(assignment.deadLine);
            const isPast = new Date(assignment.deadLine) < new Date();
            const urgency = getUrgencyConfig(daysLeft, isPast, assignment.status);
            const typeConfig = getSubmissionTypeConfig(assignment.submissionType);
            const subStatus = submissionsMap[assignment._id]?.status;
            const subStatusConfig = subStatus && subStatus !== 'pending' ? getSubmissionStatusConfig(subStatus) : null;
            const btnConfig = getButtonConfig(assignment._id, assignment.submissionType, assignment.status, assignment.deadLine);

            return (
              <div
                key={assignment._id}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-colors duration-200"
              >
                {/* urgency bar */}
                <div className={`h-0.5 w-full ${urgency.bar} opacity-60`} />

                <div className="p-5 flex flex-col flex-1 gap-4">
                  {/* top row: type badge + urgency badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${typeConfig.classes}`}>
                      <typeConfig.Icon />
                      {typeConfig.label}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${urgency.classes}`}>
                      {isPast || assignment.status === 'closed' ? <Icon.Lock /> : <Icon.Clock />}
                      {urgency.label}
                    </span>
                  </div>

                  {/* title + description */}
                  <div className="space-y-1.5">
                    <h2 className="text-base font-semibold text-slate-100 leading-snug line-clamp-2">
                      {assignment.title}
                    </h2>
                    {assignment.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {assignment.description}
                      </p>
                    )}
                  </div>

                  {/* meta row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Icon.Teacher />
                      {assignment.teacherName || 'Staff'}
                    </span>
                    {assignment.questions?.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Icon.Question />
                        {assignment.questions.length} question{assignment.questions.length !== 1 ? 's' : ''}
                        {assignment.questionType && (
                          <span className="text-slate-600">
                            · {assignment.questionType === 'true_false' ? 'True/False'
                              : assignment.questionType === 'multiple_choice' ? 'MCQ'
                              : assignment.questionType}
                          </span>
                        )}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-amber-500/70">
                      <Icon.Star />
                      {assignment.totalPoints || 0} pts
                    </span>
                  </div>

                  {/* submission status pill */}
                  {subStatusConfig && (
                    <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg w-fit ${subStatusConfig.classes}`}>
                      <subStatusConfig.Icon />
                      {subStatusConfig.label}
                    </div>
                  )}

                  {/* spacer */}
                  <div className="flex-1" />

                  {/* deadline */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <Icon.Calendar />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">Deadline</p>
                      <p className={`text-xs font-medium truncate ${isPast ? 'text-red-400' : 'text-slate-300'}`}>
                        {formatDeadline(assignment.deadLine)}
                      </p>
                    </div>
                    {/* action button */}
                    {btnConfig.show ? (
                      <button
                        onClick={() => handleSubmit(assignment._id, assignment.submissionType)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 shrink-0
                          ${btnConfig.late
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 ring-1 ring-amber-500/30'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/40'
                          }`}
                      >
                        {btnConfig.Icon && <btnConfig.Icon />}
                        {btnConfig.label}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600 shrink-0">{btnConfig.label}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── page header ────────────────────────────────────────────────────────────
const PageHeader = ({ user, count }) => (
  <div className="border-b border-slate-800 bg-slate-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Assignments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track deadlines and submit your work</p>
        </div>
        {user && (
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="text-xs">
              <p className="text-slate-300 font-medium leading-tight">{user.name}</p>
              <p className="text-slate-500 leading-tight">
                Year {user.year} · {user.major} · {user.semester === 'first' ? 'Sem 1' : 'Sem 2'}
              </p>
            </div>
          </div>
        )}
      </div>
      {count > 0 && (
        <p className="mt-4 text-xs text-slate-600">
          {count} assignment{count !== 1 ? 's' : ''} for your cohort
        </p>
      )}
    </div>
  </div>
);

export default AssignmentList;
