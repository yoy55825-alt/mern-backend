// components/ExcelImport.jsx
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // For preview functionality

const ExcelImport = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  // Handle file selection with preview
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please select an Excel file (.xlsx, .xls)');
      e.target.value = '';
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
    
    // Preview file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Show first 5 rows for preview
      setPreviewData(jsonData.slice(0, 6));
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an Excel file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/excelUsers/bulk-import-excel`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data);

    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        error: error.response?.data?.error || 'Failed to import users'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample Excel data
    const sampleData = [
      ['Name', 'Email', 'Role', 'Password', 'Major', 'Semester', 'Roll Number', 'Year', 'Department', 'Courses'],
      ['John Doe', 'john@example.com', 'student', 'password123', 'Computer Science', '4', '1001', '2024', '', ''],
      ['Jane Smith', 'jane@example.com', 'teacher', 'password456', '', '', '', '2024', 'Mathematics', 'Algebra,Calculus'],
      ['Bob Wilson', 'bob@example.com', 'student', '', 'Physics', '2', '1002', '2024', '', ''],
      ['Alice Johnson', 'alice@example.com', 'teacher', '', '', '', '', '2024', 'Computer Science', 'Data Structures,Algorithms']
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    // Generate and download
    XLSX.writeFile(wb, 'users-template.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Users from Excel</h2>
        
        {/* Instructions */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ul className="list-disc pl-5 text-blue-700 text-sm space-y-1">
            <li>Download the template below to see the required format</li>
            <li><strong>Required columns:</strong> Name, Email, Role (student/teacher)</li>
            <li><strong>Optional:</strong> Password (if empty, one will be auto-generated)</li>
            <li><strong>For students:</strong> Major, Semester, Roll Number, Year</li>
            <li><strong>For teachers:</strong> Department, Courses (comma-separated)</li>
            <li>Maximum file size: 10MB</li>
          </ul>
          
          <button
            onClick={downloadTemplate}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Excel Template
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          </div>

          {/* File Preview */}
          {previewData.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <span className="font-medium text-gray-700">Preview (First 5 rows)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm border-r">
                            {cell || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Excel File...
              </>
            ) : 'Import Users from Excel'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className={`mt-8 p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-6 h-6 mt-0.5 ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                {result.success ? '✓' : '✗'}
              </div>
              <div className="ml-3">
                <h3 className={`text-lg font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message || result.error}
                </h3>
                
                {result.stats && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{result.stats.successCount}</div>
                        <div className="text-sm text-gray-600">Users Created</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-red-600">{result.stats.errorCount}</div>
                        <div className="text-sm text-gray-600">Errors</div>
                      </div>
                    </div>
                    
                    {result.stats.successEmails && result.stats.successEmails.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Successfully imported emails:</h4>
                        <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                          {result.stats.successEmails.map((email, index) => (
                            <div key={index} className="text-sm text-gray-600 py-1 border-b last:border-b-0">
                              {email}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Display Errors */}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-red-700 mb-2">Import Errors:</h4>
                    <div className="bg-white p-3 rounded border max-h-64 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 py-2 border-b last:border-b-0">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Success Message */}
            {result.success && result.stats && result.stats.successCount > 0 && (
              <div className="mt-6 pt-6 border-t border-green-200">
                <p className="text-green-700">
                  <strong>Note:</strong> Passwords were sent to users via email. 
                  {!result.errors && " All users were created successfully!"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelImport;