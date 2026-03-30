import Assignment from "../models/Assignments.js";
import User from '../models/Users.js'
import mongoose from "mongoose";
const assignmentController = {
    //get all assignments' data
    fetch: async (req, res) => {
        const data = await Assignment.find().sort({ createdAt: -1 })
        return res.status(200).json({
            data: data,
            count: data.length
        })
    },
    //create assignment
    create: async (req, res) => {
        try {
            const {
                title,
                description,
                teacherName,
                submissionType,
                deadLine,
                status,
                targetYear,
                targetMajor,
                targetSemester,
                createdBy
            } = req.body;

            //validate deadline
            const deadLineDate = new Date(deadLine)
            if (deadLineDate <= new Date()) {
                return res.status(400).json({
                    message: 'DeadLine must be in the future'
                })
            }
            //file 
            const attachments = [];
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    attachments.push({
                        fileName: file.originalname,
                        fileUrl: file.location,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        fileKey : file.key
                    })
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
            }

            //validation error
            if (Object.keys(validationErrors).length > 0) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: validationErrors
                });
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
                targetMajor
            }

            const assignment = await Assignment.create(data)

            return res.status(200).json(assignment)
        } catch (e) {
            return res.status(500).json({
                error: e.message
            })
        }
    },
    //detail assignment
    detail: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "id not found" })
            }
            const assignment = await Assignment.findById(id)
            return res.status(200).json(assignment)
        } catch (e) {
            return res.status(400).json({ message: e })
        }
    },
    //update assignment
    update: async (req, res) => {
        try {
            console.log('Request Body:', req.body);
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "id not found" })
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

            // Handle file upload if exists
            if (req.file) {
                updateData.attachments = {
                    filename: req.file.originalname,
                    filepath: req.file.location,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                };
            }
            const assignment = await Assignment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            if (!assignment) {
                return res.status(400).josn({ message: 'there is no data' })
            }

            return res.status(200).json(assignment)
        } catch (e) {
            return res.status(400).json({ message: e.message || 'update fail' })
        }
    }

}