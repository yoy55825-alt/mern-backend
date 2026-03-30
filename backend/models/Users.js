import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "teacher", "admin"],
        required: true
    },
    //teacher profile  
    teacherProfile: {
        type: {
            department: String,
            coursesTeaching: [String]
        },
        default: undefined
    },
    //student profile
    studentProfile: {
        studentRollNumber: Number,
        semester: String,
        major: String,
        year: Number
    }
}, { timestamps: true, minimize: true })

const User = mongoose.model("User", UserSchema)
export default User;