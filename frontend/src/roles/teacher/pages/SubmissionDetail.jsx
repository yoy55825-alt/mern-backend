import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import SubmissionDetailList from './SubmissionDetailList';
const SubmissionDetail = () => {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {id}=useParams()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  console.log(id);
  
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/student/submission/fetch/subId/${id}`); 
        setSubmissions(response.data);
        console.log(response.data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return <SubmissionDetailList data={submissions} />;
};

export default SubmissionDetail;