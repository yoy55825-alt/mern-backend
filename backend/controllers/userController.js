import User from '../models/Users.js';
import bcrypt from "bcrypt";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Secret key for JWT (store in environment variables!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const userController = {
    // Get all users data
    index: async (req, res) => {
        const users = await User.find().sort({ createdAt: 1 });
        return res.status(200).json(users);
    },

    register: async (req, res) => {
        try {
            const { email, password, name, role, studentProfile, teacherProfile } = req.body;
            // Hash password
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(password, salt);
            // Check if user exists
            let userInfo = await User.findOne({ email });
            if (userInfo) {
                throw new Error("Same user exists. Try again...");
            }

            // User data
            const userData = {
                email,
                password: hash,
                name,
                role
            };

            // Validation and profile data...
            if (role == "student") {
                if (!studentProfile || !studentProfile.studentRollNumber ||
                    !studentProfile.semester || !studentProfile.major || !studentProfile.year
                )
                    return res.status(400).json({ error: "student profile required" });
            }
            if (role == "teacher") {
                if (!teacherProfile || !teacherProfile.department || !teacherProfile.coursesTeaching)
                    return res.status(400).json({ error: "teacher profile required" });
            }

            if (role == 'student') {
                userData.studentProfile = {
                    studentRollNumber: studentProfile.studentRollNumber,
                    semester: studentProfile.semester,
                    major: studentProfile.major,
                    year: studentProfile.year
                };
            }

            if (role == "teacher") {
                userData.teacherProfile = {
                    department: teacherProfile.department,
                    coursesTeaching: teacherProfile.coursesTeaching
                };
            }

            const user = await User.create(userData);

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Return user data (without sensitive info)
            return res.status(200).json({
                token: token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    ...(user.role === 'student' && {
                        rollNumber: user.studentProfile?.studentRollNumber,
                        semester: user.studentProfile?.semester,
                        major: user.studentProfile?.major,
                        year: user.studentProfile?.year
                    }),
                    ...(user.role === 'teacher' && {
                        coursesTeaching: user.teacherProfile?.coursesTeaching,
                        department: user.teacherProfile?.department
                    })
                }
            });
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },

    // User login with JWT
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: "Your information does not match our records" });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Your password is incorrect" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set HTTP-only cookie
            // res.cookie('token', token, {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === 'production',
            //     sameSite: 'strict',
            //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            // });

            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",  // Works when both are under same parent domain
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path : '/',
            });

            // Return user data based on role
            const userData = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            };

            if (user.role === 'student') {
                userData.rollNumber = user.studentProfile?.studentRollNumber;
                userData.semester = user.studentProfile?.semester;
                userData.major = user.studentProfile?.major;
                userData.year = user.studentProfile?.year;
            }

            if (user.role === 'teacher') {
                userData.coursesTeaching = user.teacherProfile?.coursesTeaching;
                userData.department = user.teacherProfile?.department;
            }

            return res.status(200).json({ user: userData, token: token });

        } catch (e) {
            return res.status(500).json({ error: "Login failed" });
        }
    },

    // NEW: Get current user from token
    getMe: async (req, res) => {
        try {
            // Get token from cookie
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({ error: "Not authenticated" });
            }

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }

            // Return user data
            const userData = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            };

            if (user.role === 'student') {
                userData.rollNumber = user.studentProfile?.studentRollNumber;
                userData.semester = user.studentProfile?.semester;
                userData.major = user.studentProfile?.major;
                userData.year = user.studentProfile?.year;
            }

            if (user.role === 'teacher') {
                userData.coursesTeaching = user.teacherProfile?.coursesTeaching;
                userData.department = user.teacherProfile?.department;
            }

            return res.status(200).json({ user: userData });

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: "Invalid token" });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Token expired" });
            }
            return res.status(500).json({ error: "Server error" });
        }
    },

    // NEW: Logout - clear the cookie
    logout: async (req, res) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        return res.status(200).json({ message: "Logged out successfully" });
    },

    // Middleware to protect routes
    protect: async (req, res, next) => {
        try {
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({ error: "Not authorized" });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ error: "Not authorized" });
        }
    },

    //delete
    delete: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "id not found" });
            }
            const user = await User.findByIdAndDelete(id);
            return res.status(200).json(user);
        } catch (e) {
            return res.status(400).json({ msg: e });
        }
    },
    //update
    update: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "id not found" });
            }
            const user = await User.findByIdAndUpdate(id, { ...req.body });

            if (!user) {
                return res.status(400).json({ message: "There is no data" });
            }

            const updatedUser = await User.findById(id);
            return res.status(200).json(updatedUser);
        } catch (e) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    //user detail
    detail: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "id not found" });
            }
            const user = await User.findById(id);
            return res.status(200).json(user);
        } catch (e) {
            return res.status(400).json({ msg: e });
        }
    }
};

export default userController;