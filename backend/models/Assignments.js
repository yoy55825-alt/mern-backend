import mongoose from "mongoose";

const AssignmentSchema=mongoose.Schema({
    title :{
        type : String,
        required : false
    },
    description :{
        type :String,
        required : false
    },
    createdBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    teacherName : {                                                                                                                     
        type : String,
        required : false
    },
    // SUBMISSION TYPE 
    submissionType: {
        type: String,
        enum: ['paper', 'file', 'online'], // paper = physical submission, file = upload file, online = answer questions in system
        required: true,
        default: 'file'
    },
    
    // QUESTION TYPE - Only relevant when submissionType is 'online'
    questionType: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'fill_blank', 'short_note', 'essay', 'mixed'],
        required: function() {
            return this.submissionType === 'online';
        }
    },
    
    // QUESTIONS ARRAY - For online assignments
    questions: [{
        questionText: {
            type: String,
            required: function() {
                return this.submissionType === 'online';
            }
        },
        questionType: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'fill_blank', 'short_note', 'essay'],
            required: function() {
                return this.submissionType === 'online';
            }
        },
        points: {
            type: Number,
            default: 1,
            min: 0
        },
        // For multiple choice questions
        options: [{
            optionText: String,
            isCorrect: Boolean,
            optionId: {
                type: String,
                default: () => new mongoose.Types.ObjectId().toString()
            }
        }],
        // For fill in blank questions
        correctAnswers: [String], // Multiple possible correct answers
        // For true/false questions
        correctBoolean: Boolean,
        // For short note/essay - no correct answer stored, teacher grades manually
        wordLimit: Number,
        // Common fields
        hint: String,
        required: {
            type: Boolean,
            default: true
        }
    }],
    
    // TOTAL POINTS - Auto-calculated
    totalPoints: {
        type: Number,
        default: 0
    },
    deadLine : {
        type : Date,
        required : false
    },
    status : {
        type : String,
        enum : ['active','closed','draft','submitted'],
        required : false
    },
    attachments : [
        {
            fileName : String,
            fileUrl : String,
            fileKey : String,
            fileType : String,
            fileSize : Number
        }
    ],
    targetYear : {
        type : Number,
        required : false
    },
    targetMajor : {
        type : String,
        required : false
    },
    targetSemester : {
        type : String,
        required : false
    }

},{timestamps : true})

// Method to check if assignment is online
AssignmentSchema.methods.isOnlineAssignment = function() {
    return this.submissionType === 'online';
};

// Method to get question count
AssignmentSchema.methods.getQuestionCount = function() {
    return this.questions ? this.questions.length : 0;
};




const Assignment = mongoose.model("Assignment", AssignmentSchema);
export default Assignment;