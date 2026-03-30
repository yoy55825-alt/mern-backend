// models/StudentSubmission.js
import mongoose from "mongoose";

const StudentSubmissionSchema = mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // For PAPER submission
    paperSubmission: {
        submitted: { type: Boolean, default: false },
        submittedDate: Date,
        receivedBy: String // Teacher name who received
    },
    
    // For FILE submission
    attachments : [
        {
            fileName : String,
            fileUrl : String,
            fileKey : String,
            fileType : String,
            fileSize : Number
        }
    ],
    
    // For ONLINE submission
    onlineSubmission: {
        answers: [{
            questionId: String,
            answer: mongoose.Schema.Types.Mixed, // Can be String, Array, Boolean, etc.
            isCorrect: Boolean,
            pointsEarned: Number,
            submittedAt: Date
        }],
        score: {
            earned: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 }
        },
        startedAt: Date,
        completedAt: Date,
        timeSpent: Number, // in seconds
        attemptsCount: { type: Number, default: 1 }
    },
    
    submissionType: {
        type: String,
        enum: ['paper', 'file', 'online'],
        required: true
    },
    
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded', 'late', 'absent'],
        default: 'pending'
    },
    
    grade: {
        score: { type: Number, default: 0 },
        feedback: String,
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        gradedAt: Date
    },
    
    submittedAt: Date,
    isLate: { type: Boolean, default: false }

}, { timestamps: true });

// Compound index to prevent duplicate submissions
StudentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const StudentSubmission = mongoose.model("StudentSubmission", StudentSubmissionSchema);
export default StudentSubmission;