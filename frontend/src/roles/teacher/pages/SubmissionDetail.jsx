import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { FaExclamationCircle } from 'react-icons/fa';
import SubmissionDetailList from './SubmissionDetailList';
import './SubmissionDetail.css';

const SubmissionDetail = () => {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/student/submission/fetch/subId/${id}`);
        setSubmissions(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'We could not load this submission.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [API_URL, id]);

  if (loading) {
    return (
      <main className="submission-detail-page submission-state">
        <div className="submission-loader" aria-hidden="true" />
        <h2>Loading submission</h2>
        <p>Getting the latest details and score...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="submission-detail-page submission-state submission-error">
        <FaExclamationCircle />
        <h2>Unable to load submission</h2>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
      </main>
    );
  }

  return <SubmissionDetailList data={submissions} />;
};

export default SubmissionDetail;
