// routes/userRoutes.js
import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import User from '../models/Users.js'

const router = express.Router();

// Configure multer for Excel files only
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv' // Optional: include CSV if needed
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed (.xlsx, .xls)'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Bulk import users from Excel
router.post('/bulk-import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded or invalid file type'
      });
    }

    const filePath = req.file.path;

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const users = xlsx.utils.sheet_to_json(sheet);

    if (users.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: 'Excel file is empty or has no data'
      });
    }

    const processedUsers = [];
    const errors = [];
    const successEmails = [];

    // Process each row
    for (let i = 0; i < users.length; i++) {
      const row = users[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1, and header is row 1

      try {
        // Extract data with defaults
        const name = row['Name'] || row['name'] || '';
        const email = (row['Email'] || row['email'] || '').toLowerCase().trim();
        const role = (row['Role'] || row['role'] || '').toLowerCase().trim();
        const password = row['Password'] || row['password'] || '';

        // Validate required fields
        if (!name) {
          errors.push(`Row ${rowNumber}: Name is required`);
          continue;
        }
        if (!email) {
          errors.push(`Row ${rowNumber}: Email is required`);
          continue;
        }
        if (!role) {
          errors.push(`Row ${rowNumber}: Role is required (student/teacher)`);
          continue;
        }
        if (!['student', 'teacher'].includes(role)) {
          errors.push(`Row ${rowNumber}: Role must be 'student' or 'teacher'`);
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          errors.push(`Row ${rowNumber}: Email ${email} already exists`);
          continue;
        }

        // Prepare user data based on your existing structure
        const userData = {
          name: name.trim(),
          email: email,
          role: role
        };

        // Add password if provided
        if (password.trim() !== '') {
          userData.password = password.trim();
        }

        // Handle student profile
        if (role === 'student') {
          userData.studentProfile = {
            major: row['Major'] || row['major'] || '',
            semester: row['Semester'] || row['semester'] || '',
            studentRollNumber: Number(row['Roll Number'] || row['rollNo'] || row['RollNo'] || 0),
            year: Number(row['Year'] || row['year'] || new Date().getFullYear())
          };
        }

        // Handle teacher profile
        if (role === 'teacher') {
          const courses = row['Courses'] || row['courses'] || row['CoursesTeaching'] || '';
          userData.teacherProfile = {
            department: row['Department'] || row['department'] || '',
            coursesTeaching: courses
              ? courses.toString().split(',').map(c => c.trim()).filter(Boolean)
              : []
          };
        }

        // Create user (adapt to your existing user creation logic)
        const user = await User.create(userData);
        processedUsers.push(user);
        successEmails.push(email);

      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return results
    res.status(200).json({
      success: true,
      message: `Import completed. ${processedUsers.length} user(s) created successfully.`,
      stats: {
        totalRows: users.length,
        successCount: processedUsers.length,
        errorCount: errors.length,
        successEmails: successEmails
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Import error:', error);

    // Clean up file if exists
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) { }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process Excel file. Please check the format.'
    });
  }
});

export default router;