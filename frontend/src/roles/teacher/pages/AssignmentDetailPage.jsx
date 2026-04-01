import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';

const AssignmentDetailPage = () => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {id}=useParams()
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const assignmentId = "69ccdbee0e0205951abec165"; // Your assignment ID

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/teacher/assignment/detail/${id}`, {
          withCredentials: true
        });
        setAssignment(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, []);

  const getSubmissionTypeBadge = (type) => {
    const styles = {
      online: 'bg-blue-100 text-blue-800',
      file: 'bg-green-100 text-green-800',
      paper: 'bg-purple-100 text-purple-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">No assignment found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
            {assignment.status && (
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                assignment.status === 'active' ? 'bg-green-500' :
                assignment.status === 'closed' ? 'bg-red-500' :
                'bg-gray-500'
              } text-white`}>
                {assignment.status.toUpperCase()}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            {assignment.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
                <p className="text-gray-700">{assignment.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Teacher</p>
                <p className="font-semibold text-gray-800">{assignment.teacherName || 'Not specified'}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Submission Type</p>
                <span className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${getSubmissionTypeBadge(assignment.submissionType)}`}>
                  {assignment.submissionType?.toUpperCase() || 'N/A'}
                </span>
              </div>
              
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="font-semibold text-gray-800">
                  {assignment.deadLine ? new Date(assignment.deadLine).toLocaleString() : 'No deadline'}
                </p>
              </div>
            </div>

            {/* Total Points */}
            {assignment.totalPoints > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Total Points</p>
                <p className="text-2xl font-bold text-blue-600">{assignment.totalPoints}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;