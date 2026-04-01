import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../context/userContext';
import axios from 'axios';
import { CalendarDays, User, BookOpen, PlusCircle, Trash2, Edit3, Upload, FileText, XCircle, Settings } from 'lucide-react';
import "./CreateQuestion.css"
import { toast } from 'react-toastify';
const AssignmentForm = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [error, setError] = useState({});
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacherName: '',
    submissionType: 'file', // 'paper', 'file', 'online'
    deadLine: '',
    status: 'draft',
    targetYear: '',
    targetMajor: '',
    targetSemester: '',
    totalPoints : 10
  });

  // Online assignment specific states
  const [questionType, setQuestionType] = useState('mixed');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    points: 1,
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ],
    correctAnswers: [''],
    correctBoolean: true,
    wordLimit: 500,
    hint: '',
    required: true
  });

  // File upload state
  const [file, setFile] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // Options
  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' },
    { value: '6', label: '6th Year' }
  ];

  const semesterOptions = [
    { value: 'first', label: 'First Semester' },
    { value: 'second', label: 'Second Semester' }
  ];

  const majorOptions = [
    { value: 'Civil', label: 'Civil Engineering' },
    { value: 'Electrical', label: 'Electrical Engineering' },
    { value: 'Electrical power', label: 'Electrical Power Engineering' },
    { value: 'Mechanical', label: 'Mechanical Engineering' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Mechatronic', label: 'Mechatronic Engineering' },
    { value: 'Petrol', label: 'Petroleum Engineering' },
    { value: 'Mining', label: 'Mining Engineering' },
    { value: 'Chemical Engineering', label: 'Chemical Engineering' }
  ];

  const submissionTypeOptions = [
    { value: 'paper', label: 'Paper (Physical Submission)' },
    { value: 'file', label: 'File Upload' },
    { value: 'online', label: 'Online (Answer Questions)' }
  ];

  const questionTypeOptions = [
    { value: 'mixed', label: 'Mixed Types' },
    { value: 'multiple_choice', label: 'Multiple Choice Only' },
    { value: 'true_false', label: 'True/False Only' },
    { value: 'fill_blank', label: 'Fill in Blank Only' },
    { value: 'short_note', label: 'Short Note Only' },
    { value: 'essay', label: 'Essay Only' }
  ];

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/index`);
      setUsers(response.data.users || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Question management
  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      toast.error("Please enter question text");
      return;
    }

    // Validate based on question type
    if (currentQuestion.questionType === 'multiple_choice') {
      const validOptions = currentQuestion.options.filter(opt => opt.optionText.trim());
      if (validOptions.length < 2) {
        toast.error("Please add at least 2 options");
        return;
      }
      const hasCorrect = currentQuestion.options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        toast.error("Please select at least one correct answer");
        return;
      }
    }

    if (currentQuestion.questionType === 'fill_blank') {
      const validAnswers = currentQuestion.correctAnswers.filter(ans => ans.trim());
      if (validAnswers.length === 0) {
        toast.error("Please add at least one correct answer");
        return;
      }
    }

    let formattedQuestion = { ...currentQuestion, id: Date.now() };

    // Clean up unnecessary fields
    if (currentQuestion.questionType === 'true_false') {
      delete formattedQuestion.options;
      delete formattedQuestion.correctAnswers;
    } else if (currentQuestion.questionType === 'fill_blank') {
      delete formattedQuestion.options;
      delete formattedQuestion.correctBoolean;
    } else if (currentQuestion.questionType === 'short_note' || currentQuestion.questionType === 'essay') {
      delete formattedQuestion.options;
      delete formattedQuestion.correctAnswers;
      delete formattedQuestion.correctBoolean;
    } else if (currentQuestion.questionType === 'multiple_choice') {
      delete formattedQuestion.correctAnswers;
      delete formattedQuestion.correctBoolean;
    }

    setQuestions([...questions, formattedQuestion]);

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ],
      correctAnswers: [''],
      correctBoolean: true,
      wordLimit: 500,
      hint: '',
      required: true
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    removeQuestion(index);
  };

  // Option management
  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { optionText: '', isCorrect: false }]
    }));
  };

  const updateOption = (index, field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeOption = (index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  // Fill blank answers management
  const addCorrectAnswer = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      correctAnswers: [...prev.correctAnswers, '']
    }));
  };

  const updateCorrectAnswer = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers.map((ans, i) =>
        i === index ? value : ans
      )
    }));
  };

  const removeCorrectAnswer = (index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers.filter((_, i) => i !== index)
    }));
  };

  // File handling
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  // Toast container
  const toastContainer = document.getElementById('toast-container');

  // Show toast notification
  const showToast = (message, type = 'error') => {
    const toast = document.createElement('div');
    toast.className = `toast toast - ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Calculate total points
  const totalPoints = questions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0);

  // Handle form submission
  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    // Validate required fields
    // if (!formData.title.trim()) {
    //   showToast("Please enter assignment title", "error")
    //   return;
    // }

    // if (!formData.description.trim()) {
    //   alert('Please enter description');
    //   return;
    // }

    // if (!formData.teacherName) {
    //   alert('Please select a teacher');
    //   return;
    // }

    // if (!formData.deadLine) {
    //   alert('Please set a deadline');
    //   return;
    // }

    // if (!formData.targetYear || !formData.targetMajor || !formData.targetSemester) {
    //   alert('Please fill all target student fields');
    //   return;
    // }

    // // Validate online assignment questions
    // if (formData.submissionType === 'online' && questions.length === 0 && !isDraft) {
    //   alert('Please add at least one question');
    //   return;
    // }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('teacherName', formData.teacherName);
      submitData.append('submissionType', formData.submissionType);
      submitData.append('deadLine', formData.deadLine);
      submitData.append('status', isDraft ? 'draft' : 'active');
      submitData.append('targetYear', Number(formData.targetYear));
      submitData.append('targetMajor', formData.targetMajor);
      submitData.append('targetSemester', formData.targetSemester);
      submitData.append('createdBy', user?.id);

       // Handle total points based on submission type
      if (formData.submissionType === 'online') {
        submitData.append('questionType', questionType);
        submitData.append('questions', JSON.stringify(questions));
        submitData.append('totalPoints', totalPoints);
      } else if (formData.submissionType === 'file') {
        // For file submissions, use the totalPoints from formData
        submitData.append('totalPoints', formData.totalPoints || 10);
      } else if (formData.submissionType === 'paper') {
        // For paper submissions, total points might be set separately
        submitData.append('totalPoints', formData.totalPoints || 10);
      }

      if (file) {
        submitData.append('attachments', file);
      }

      const res = await axios.post(
        `${API_URL}/api/teacher/assignment/create`,
        submitData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success(isDraft ? 'Draft saved successfully!' : 'Assignment published successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          teacherName: '',
          submissionType: 'file',
          deadLine: '',
          status: 'draft',
          targetYear: '',
          targetMajor: '',
          targetSemester: '',
          totalPoints : 10
        });
        setQuestions([]);
        setFile(null);
        setSelectedDepartment('');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError(err.response?.data?.errors || {});
      console.log("failed to save assignment");

    }
  };

  const saveAsDraft = (e) => {
    handleSubmit(e, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Assignment</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter assignment title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error.title && (
                <p className="text-red-600 text-sm mt-2 font-medium">Title is required</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter assignment description and instructions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error.description && (
                <p className="text-red-600 text-sm mt-2 font-medium">Description is required</p>
              )}
            </div>

            {/* Teacher Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setFormData(prev => ({ ...prev, teacherName: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {majorOptions.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  disabled={!selectedDepartment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Teacher</option>
                  {selectedDepartment && users
                    .filter(u => u.role === 'teacher' && u.teacherProfile?.department === selectedDepartment)
                    .map(teacher => (
                      <option key={teacher._id} value={teacher.name}>{teacher.name}</option>
                    ))
                  }
                  {/* {error.teacherName && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Teacher's name is required</p>
                  )} */}
                </select>
                {error.teacherName && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Teacher's name is required</p>
                  )}
              </div>
            </div>

            {/* Submission Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Type <span className="text-red-500">*</span>
              </label>
              <select
                name="submissionType"
                value={formData.submissionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {submissionTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="deadLine"
                value={formData.deadLine}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
               {error.deadLine && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Deadline is required</p>
                  )}
            </div>

            {/* Target Students */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="targetYear"
                  value={formData.targetYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {error.targetYear && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Year is required</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major <span className="text-red-500">*</span>
                </label>
                <select
                  name="targetMajor"
                  value={formData.targetMajor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Major</option>
                  {majorOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {error.targetMajor && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Major is required</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="targetSemester"
                  value={formData.targetSemester}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {error.targetSemester && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Semester is required</p>
                  )}
              </div>
            </div>

            {/* Online Assignment Section */}
            {formData.submissionType === 'online' && (
              <div className="border-t pt-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Questions & Settings</h2>

                {/* Question Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Question Type
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {questionTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Add Question Form */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Add New Question</h3>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Question text"
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={currentQuestion.questionType}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionType: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="fill_blank">Fill in Blank</option>
                        <option value="short_note">Short Note</option>
                        <option value="essay">Essay</option>
                      </select>

                      <input
                        type="number"
                        placeholder="Points"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseFloat(e.target.value) })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Multiple Choice Options */}
                    {currentQuestion.questionType === 'multiple_choice' && (
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Option ${idx + 1}`}
                              value={opt.optionText}
                              onChange={(e) => updateOption(idx, 'optionText', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={opt.isCorrect}
                                onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                              />
                              Correct
                            </label>
                            {currentQuestion.options.length > 2 && (
                              <button type="button" onClick={() => removeOption(idx)} className="text-red-500">×</button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={addOption} className="text-sm text-blue-600">+ Add Option</button>
                      </div>
                    )}

                    {/* True/False */}
                    {currentQuestion.questionType === 'true_false' && (
                      <select
                        value={currentQuestion.correctBoolean}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctBoolean: e.target.value === 'true' })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    )}

                    {/* Fill in Blank */}
                    {currentQuestion.questionType === 'fill_blank' && (
                      <div className="space-y-2">
                        {currentQuestion.correctAnswers.map((ans, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Correct answer ${idx + 1}`}
                              value={ans}
                              onChange={(e) => updateCorrectAnswer(idx, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            {currentQuestion.correctAnswers.length > 1 && (
                              <button type="button" onClick={() => removeCorrectAnswer(idx)} className="text-red-500">×</button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={addCorrectAnswer} className="text-sm text-blue-600">+ Add Another Answer</button>
                      </div>
                    )}

                    {/* Hint */}
                    <input
                      type="text"
                      placeholder="Hint (optional)"
                      value={currentQuestion.hint}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, hint: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                {questions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-800">Questions ({questions.length}) - Total Points: {totalPoints}</h3>
                    {questions.map((q, idx) => (
                      <div key={q.id || idx} className="border p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{idx + 1}. {q.questionText}</p>
                            <p className="text-sm text-gray-600">{q.questionType} • {q.points} pts</p>
                            {q.options && (
                              <p className="text-sm text-gray-500 mt-1">
                                {q.options.filter(o => o.isCorrect).length} correct option(s)
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => editQuestion(idx)} className="text-blue-600">Edit</button>
                            <button type="button" onClick={() => removeQuestion(idx)} className="text-red-600">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* File Upload */}
            {(formData.submissionType === 'paper' || formData.submissionType === 'file') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments(optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {file && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    <button type="button" onClick={removeFile} className="ml-2 text-red-500">Remove</button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={saveAsDraft}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;