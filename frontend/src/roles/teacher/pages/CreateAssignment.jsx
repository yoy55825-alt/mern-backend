import React, { useState } from 'react';
import {
  CalendarDays,
  Upload,
  FileText,
  User,
  BookOpen,
  Clock,
  XCircle
} from 'lucide-react';
import axios from 'axios'
import { useContext } from 'react';
import { UserContext } from '../../../context/userContext';
import { useParams } from 'react-router';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user } = useContext(UserContext)

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [submissionType, setSubmissionType] = useState('file');
  const [deadLine, setDeadLine] = useState('');
  const [status, setStatus] = useState('draft');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [semester, setSemester] = useState('');
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState({})
  //for all teachers
  const [users, setUsers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  let { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


  // get Assignment detail 
  const fetchData = async () => {
    const res = await axios.get(`${API_URL}/api/teacher/assignment/detail/` + id);
    if (res.status == 200) {
      const data = res.data
      setIsEditing(true)
      setTitle(data.title)
      setDescription(data.description)
      setTeacherName(data.teacherName)
      setSubmissionType(data.submissionType)
      //dead line format
      const deadlineDate = new Date(data.deadLine);
      const formattedDeadline = deadlineDate.toISOString().replace('Z', '');
      setDeadLine(formattedDeadline)
      setStatus(data.status)
      setYear(data.targetYear.toString())
      setMajor(data.targetMajor)
      setSemester(data.targetSemester)
    }

  }
  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const handleSubmit = async (e, isDraft = false) => {
    try {
      e.preventDefault();
      const currentStatus = isDraft ? 'draft' : 'active';
      const createdBy = user.id;

      if (!createdBy) {
        alert('User not authenticated');
        return;
      }
      const formData = new FormData();
      formData.append('title', title)
      formData.append('description', description)
      formData.append('teacherName', teacherName)
      formData.append('submissionType', submissionType)
      formData.append('deadLine', deadLine)
      formData.append('status', currentStatus)
      formData.append('targetYear', Number(year))
      formData.append('targetMajor', major)
      formData.append('targetSemester', semester)
      formData.append('createdBy', createdBy)
      if (file) {
        formData.append('attachments', file)
      }
      let res;
      if (isEditing) {
        res = await axios.patch(`${API_URL}/api/teacher/assignment/update/` + id,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
      } else {
        res = await axios.post(
          `${API_URL}/api/teacher/assignment/create`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
      }

      if (res.status == 200) {
        if (isDraft) {
          alert("Draft saved successfully")
        } else {
          alert('Assignment published successfully!');
          setTitle('');
          setDescription('');
          setTeacherName('');
          setDeadLine('');
          setYear('');
          setMajor('');
          setSemester('');
          setFile(null);
        }
      }
      console.log(res);
    } catch (e) {
      setError(e.response.data.errors);
      console.log(e.response.data.errors);

    }

  };
  //validate file 
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    console.log(file);
    
  };
  //remove selected file
  const removeFile = () => {
    setFile(null);
  };
  // save as draft 
  const saveAsDraft = (e) => {
    handleSubmit(e, true)
  }
  //helper function for checking all fields are empty
  const isFormEmpty = () => {
    return (
      !title.trim() &&
      !description.trim() &&
      !teacherName.trim() &&
      !deadLine &&
      !year &&
      !major.trim() &&
      !semester.trim() &&
      !file
    );
  };

  //for fetching  teachers data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/index`);
      setUsers(response.data.users || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  //select option value
  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' },
    { value: '6', label: '6th Year' },
  ];

  const semesterOptions = [
    { value: 'first', label: 'First Semester' },
    { value: 'second', label: 'Second Semester' },
  ];

  const majorOptions = [
    { value: 'Civil', label: 'Civil Engineering' },
    { value: 'Archi', label: 'Architecture Engineering' },
    { value: 'Ec', label: 'Electronic Engineering' },
    { value: 'Ep', label: 'Electrical Engineering' },
    { value: 'Mech', label: 'Mechanical Engineering' },
    { value: 'IT', label: 'Information Technology Engineering' },
    { value: 'Mc', label: 'Mechatronic Engineering' },
    { value: 'Che', label: 'Chemical Engineering' },
    { value: 'Min', label: 'Mining Engineering' },
    { value: 'Pt', label: 'Petroleum Engineering' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Create New Assignment
          </h1>
          <p className="text-gray-600">
            Fill in the details below to create an assignment for your students
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title & Description Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Assignment Details</h2>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter assignment title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                    placeholder="Enter detailed instructions for students..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  {error.description && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Description is required</p>
                  )}
                </div>
              </div>
            </div>

            {/* Teacher Info & Submission Type */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Teacher Name with Department Selection */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Teacher Information</h2>
                </div>

                {/* Department Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department/Major<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setTeacherName('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Department</option>
                    {majorOptions?.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teacher Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Name<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    // disabled={!selectedDepartment}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${!selectedDepartment
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                      : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select a teacher</option>
                    {selectedDepartment && 
                      users
                        .filter(user => user.role === 'teacher' && user.teacherProfile?.department === selectedDepartment)
                        .map((teacher) => (
                          <option key={teacher._id} value={teacher.name}>
                            {teacher.name} 
                          </option>
                        ))
                    }
                  </select>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={deadLine}
                    onChange={(e) => setDeadLine(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"

                  />
                  {error.deadLine && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Deadline is required</p>
                  )}
                </div>
              </div>
            </div>

            {/* Student Targeting Section */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Target Students</h2>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Select the specific group of students who should receive this assignment
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"

                  >
                    <option value="" disabled>Select Year</option>
                    {yearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {error.targetYear && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Year is required</p>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"

                  >
                    <option value="" disabled>Select Semester</option>
                    {semesterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {error.targetSemester && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Semester is required</p>
                  )}
                </div>

                {/* Major */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Major<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"

                  >
                    <option value="" disabled>Select Major</option>
                    {majorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {error.targetMajor && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Major is required</p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Supporting Files</h2>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Upload any additional files (optional). Max file size: 10MB
              </p>

              <div className="space-y-4">
                {/* File Upload Area */}
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          {file ? 'Replace file' : 'Click to upload'}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          or drag and drop
                        </p>
                      </div>
                      <p className="text-gray-400 text-xs">
                        JPG, PNG, GIF, PDF, DOC, DOCX, TXT up to 10MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* Selected File Preview */}
                {file && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
                      >
                        <XCircle className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={saveAsDraft}
                  disabled={isFormEmpty()}
                  className={`px-4 py-2 rounded ${isFormEmpty() ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-500 text-white hover:bg-gray-600'}`}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Create Assignment
                </button>
              </div>
            </div>

            {/* Summary Card (Optional)
            {title && (year || semester || major) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Assignment Preview
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium">{title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Group</p>
                    <p className="font-medium">
                      {year && `Year ${year}`} 
                      {semester && `, ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester`}
                      {major && `, ${majorOptions.find(m => m.value === major)?.label}`}
                    </p>
                  </div>
                </div>
              </div>
            )} */}
          </form>
        </div>

        {/* Footer Note
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>All fields marked with * are required</p>
          <p className="mt-1">Assignment will be visible only to students matching the selected criteria</p>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;