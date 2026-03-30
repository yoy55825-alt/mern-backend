import Assignment from "../models/Assignments.js";
import User from '../models/Users.js'
import mongoose from "mongoose";

const assignmentController = {
    //get all assignments' data
    fetch: async (req, res) => {
        try {
            const now = new Date();

            const result = await Assignment.updateMany(
                {
                    deadLine: { $lte: now },
                    status: { $ne: 'closed' }
                },
                {
                    $set: { status: 'closed' }
                }
            );

            // console.log("Matched:", result.matchedCount);
            // console.log("Modified:", result.modifiedCount);

            const data = await Assignment.find().sort({ createdAt: -1 });

            return res.status(200).json({
                data,
                count: data.length
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    //create assignment
    create: async (req, res) => {
        try {
            const {
                title,
                description,
                teacherName,
                submissionType,
                questionType,//
                questions,//
                deadLine,
                status,
                targetYear,
                targetMajor,
                targetSemester,
                createdBy
            } = req.body;

            // Parse JSON strings if they come as strings from form-data
            let parsedQuestions = questions;

            if (typeof questions === 'string') {
                try {
                    parsedQuestions = JSON.parse(questions);
                } catch (e) {
                    console.error('Error parsing questions:', e);
                }
            }

            //validate deadline
            const deadLineDate = new Date(deadLine);
            if (deadLineDate <= new Date()) {
                return res.status(400).json({
                    message: 'Deadline must be in the future'
                });
            }

            //file attachments
            const attachments = [];
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    attachments.push({
                        fileName: file.originalname,
                        fileUrl: file.location,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        fileKey: file.key
                    });
                });
            }

            //validation
            const validationErrors = {};

            if (status === 'active') {
                if (!title || !title.trim()) {
                    validationErrors.title = 'Title is required';
                }

                if (!description || !description.trim()) {
                    validationErrors.description = 'Description is required';
                }

                if (!teacherName || !teacherName.trim()) {
                    validationErrors.teacherName = 'Teacher name is required';
                }

                if (!deadLine) {
                    validationErrors.deadLine = 'Deadline is required';
                }

                if (targetYear === undefined || targetYear === null || targetYear === '' || targetYear === '0') {
                    validationErrors.targetYear = 'Target year is required';
                }

                if (!targetMajor || !targetMajor.trim()) {
                    validationErrors.targetMajor = 'Target major is required';
                }

                if (!targetSemester || !targetSemester.trim()) {
                    validationErrors.targetSemester = 'Target semester is required';
                }

                if (!createdBy) {
                    validationErrors.general = 'User authentication required';
                }

                // Validate questions for online submission
                if (submissionType === 'online') {
                    if (!parsedQuestions || parsedQuestions.length === 0) {
                        validationErrors.questions = 'At least one question is required for online assignments';
                    }
                }
            }

            //validation error
            if (Object.keys(validationErrors).length > 0) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            // Calculate total points for online assignments
            let calculatedTotalPoints = 0;
            if (submissionType === 'online' && parsedQuestions) {
                calculatedTotalPoints = parsedQuestions.reduce((total, q) => total + (parseInt(q.points) || 1), 0);
            }else{
                calculatedTotalPoints = 10;
            }

            const data = {
                title,
                description,
                createdBy,
                teacherName,
                submissionType,
                deadLine,
                status,
                attachments,
                targetYear,
                targetSemester,
                targetMajor,
                // Add totalPoints for ALL submission types
                totalPoints: calculatedTotalPoints,
                // Online specific fields only
                ...(submissionType === 'online' && {
                    questionType: questionType || 'mixed',
                    questions: parsedQuestions || []
                })
            };
            const assignment = await Assignment.create(data);

            //checking
            const isOnline = assignment.isOnlineAssignment();
            const questionCount = assignment.getQuestionCount();
            return res.status(200).json({ assignment, isOnline, questionCount });
        } catch (e) {
            return res.status(500).json({
                error: e.message
            });
        }
    },

    //detail assignment
    detail: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }
            const assignment = await Assignment.findById(id);
            if (!assignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }
            return res.status(200).json(assignment);
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
    },

    //update assignment
    update: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            // Parse JSON fields
            let parsedQuestions = req.body.questions;
            let parsedSettings = req.body.settings;

            if (typeof req.body.questions === 'string') {
                try {
                    parsedQuestions = JSON.parse(req.body.questions);
                } catch (e) { }
            }

            if (typeof req.body.settings === 'string') {
                try {
                    parsedSettings = JSON.parse(req.body.settings);
                } catch (e) { }
            }

            // Create update object
            const updateData = {
                title: req.body.title,
                description: req.body.description,
                teacherName: req.body.teacherName,
                submissionType: req.body.submissionType,
                deadLine: req.body.deadLine,
                status: req.body.status,
                targetYear: req.body.targetYear,
                targetMajor: req.body.targetMajor,
                targetSemester: req.body.targetSemester,
                updatedAt: new Date()
            };

            // Add online specific fields
            if (req.body.submissionType === 'online') {
                updateData.questionType = req.body.questionType || 'mixed';
                updateData.questions = parsedQuestions || [];
                updateData.settings = parsedSettings || {};

                // Recalculate total points
                if (parsedQuestions && parsedQuestions.length > 0) {
                    updateData.totalPoints = parsedQuestions.reduce((total, q) => total + (parseInt(q.points) || 1), 0);
                }
            }

            // Handle file upload if exists
            if (req.files && req.files.length > 0) {
                updateData.attachments = req.files.map(file => ({
                    fileName: file.originalname,
                    fileUrl: file.location,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    fileKey: file.key
                }));
            }

            const assignment = await Assignment.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            });

            if (!assignment) {
                return res.status(404).json({ message: 'Assignment not found' });
            }

            return res.status(200).json(assignment);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Update failed' });
        }
    },

    // Delete assignment
    delete: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            const assignment = await Assignment.findByIdAndDelete(id);
            if (!assignment) {
                return res.status(404).json({ message: 'Assignment not found' });
            }

            return res.status(200).json({ message: 'Assignment deleted successfully' });
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
    },

    //for checking assignment type
    checkAssignmentType: async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid assignment ID format"
                });
            }

            const assignment = await Assignment.findById(id).select('submissionType title description deadLine');

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: "Assignment not found"
                });
            }

            return res.status(200).json({
                success: true,
                submissionType: assignment.submissionType,
                assignment: assignment
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default assignmentController;