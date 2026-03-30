import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/teacher/assignment/fetchAll');
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      alert('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on status and search term
  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = filter === 'all' || assignment.status === filter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.teacherName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.includes('word')) {
      return '📝';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('image')) {
      return '🖼️';
    } else {
      return '📎';
    }
  };

  // Handle assignment click
  const handleAssignmentClick = (assignmentId) => {
    // For now, just log and show an alert
    console.log('Clicked assignment:', assignmentId);
    alert(`Assignment ${assignmentId} clicked. You'll implement the popup/detail view here.`);
    // In the future: setSelectedAssignment(assignmentId) and show modal/detail page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600 mt-2">Manage and view all your created assignments</p>
            </div>
            <Link
              to={"/teacher/createAssignment"}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Assignment
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg border transition-colors ${filter === 'all' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg border transition-colors ${filter === 'active' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Published
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg border transition-colors ${filter === 'draft' 
                  ? 'bg-yellow-600 text-white border-yellow-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Drafts
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => a.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => a.status === 'draft').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No assignments found</h3>
                <p className="mt-2 text-gray-600">
                  {searchTerm 
                    ? 'No assignments match your search criteria' 
                    : filter !== 'all' 
                      ? `No ${filter} assignments found` 
                      : 'Get started by creating your first assignment'}
                </p>
                {!searchTerm && filter === 'all' && (
                  <Link
                    to="/create-assignment"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Create Assignment
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Assignment Count */}
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {filteredAssignments.length} of {assignments.length} assignments
                  </p>
                  <button
                    onClick={fetchAssignments}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                {/* Assignment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      onClick={() => handleAssignmentClick(assignment._id)}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">By {assignment.teacherName}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 line-clamp-2 text-sm">
                          {assignment.description || 'No description provided'}
                        </p>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        {/* Target Students */}
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">TARGET STUDENTS</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                              Year {assignment.targetYear}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs">
                              {assignment.targetMajor}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs">
                              {assignment.targetSemester} Semester
                            </span>
                          </div>
                        </div>

                        {/* Submission Info */}
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">SUBMISSION TYPE</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {assignment.submissionType === 'file' ? 'File Upload' : 
                             assignment.submissionType === 'text' ? 'Text Submission' : 'Both'}
                          </span>
                        </div>

                        {/* Attachments */}
                        {assignment.attachments && assignment.attachments.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">ATTACHMENTS</p>
                            <div className="space-y-2">
                              {assignment.attachments.map((file, index) => (
                                <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                  <span className="text-lg mr-2">{getFileIcon(file.fileType)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {file.fileName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(file.fileSize / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Deadline */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">DEADLINE</p>
                          <div className="flex items-center text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{formatDate(assignment.deadLine)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created on {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : "date not available"}
                        </span>
                        <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                          View Details →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;