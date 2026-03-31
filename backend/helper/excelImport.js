// routes/userRoutes.js
import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import bcrypt from 'bcrypt'; // ✅ Added bcrypt import
import User from '../models/Users.js';

const router = express.Router();

// ✅ Use memoryStorage for Render (no disk writes)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage, // ✅ Changed to memoryStorage
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed (.xlsx, .xls, .csv)'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Bulk import users from Excel
router.post('/bulk-import-excel', upload.single('file'), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded or invalid file type'
      });
    }

    console.log('Processing file:', {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

    // ✅ Read Excel file from buffer (not from disk path)
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const users = xlsx.utils.sheet_to_json(sheet);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Excel file is empty or has no data'
      });
    }

    console.log(`Found ${users.length} users to process`);

    const processedUsers = [];
    const errors = [];
    const successEmails = [];

    // Process each row
    for (let i = 0; i < users.length; i++) {
      const row = users[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1, and header is row 1

      try {
        // Extract data with defaults (handle multiple column name variations)
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
          errors.push(`Row ${rowNumber}: Role must be 'student' or 'teacher' (got: ${role})`);
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          errors.push(`Row ${rowNumber}: Email ${email} already exists`);
          continue;
        }

        // Hash password (generate default if not provided)
        const finalPassword = password.trim() || generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(finalPassword, salt);

        // Prepare user data
        const userData = {
          name: name.trim(),
          email: email,
          role: role,
          password: hash
        };

        // Handle student profile
        if (role === 'student') {
          const rollNumber = row['Roll Number'] || row['rollNo'] || row['RollNo'] || row['rollNumber'] || 0;
          const year = row['Year'] || row['year'] || new Date().getFullYear();
          const semester = row['Semester'] || row['semester'] || '';
          const major = row['Major'] || row['major'] || '';
          
          userData.studentProfile = {
            major: String(major),
            semester: String(semester),
            studentRollNumber: Number(rollNumber),
            year: Number(year)
          };
        }

        // Handle teacher profile
        if (role === 'teacher') {
          const courses = row['Courses'] || row['courses'] || row['CoursesTeaching'] || '';
          const department = row['Department'] || row['department'] || '';
          
          userData.teacherProfile = {
            department: String(department),
            coursesTeaching: courses
              ? courses.toString().split(',').map(c => c.trim()).filter(Boolean)
              : []
          };
        }

        // Create user
        const user = await User.create(userData);
        processedUsers.push(user);
        successEmails.push(email);

        console.log(`✓ Created user: ${email} (${role})`);

      } catch (error) {
        console.error(`Error row ${rowNumber}:`, error.message);
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    console.log(`Import completed: ${processedUsers.length} success, ${errors.length} errors`);

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
    
    res.status(500).json({
      success: false,
      error: 'Failed to process Excel file. Please check the format.',
      details: error.message
    });
  }
});

// Helper function to generate random password
function generateRandomPassword() {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export default router;