import React, { useState, useContext, useEffect } from 'react'
import axios from "axios"
import Navbar from '../components/AdminNavbar'
import { useNavigate } from 'react-router'
import { UserContext } from '../../../context/userContext'
import './CreateAcc.css'
import { useParams } from 'react-router'
const CreateAcc = () => {
    let { dispatch } = useContext(UserContext)
    const navigate = useNavigate()
    const [role, setRole] = useState("admin")
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [year, setYear] = useState('')
    const [major, setMajor] = useState('')
    const [rollNo, setRollNo] = useState('')
    const [semester, setSemester] = useState('')
    const [error, setError] = useState('')
    const [courses, setCourses] = useState('')
    const [department, setDepartment] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    let { id } = useParams();

    //get user information
    const fetchData = async () => {
        const res = await axios.get("http://localhost:3000/api/user/detail/" + id)
        if (res.status == 200) {
            const user = res.data
            setIsEditing(true)

            // Set basic user data
            setName(user.name || '')
            setEmail(user.email || '')
            setRole(user.role || 'student')
            // Set student profile data if role is student
            if (user.role === 'student' && user.studentProfile) {
                setYear(user.studentProfile.year?.toString() || '')
                setMajor(user.studentProfile.major || '')
                setRollNo(user.studentProfile.studentRollNumber?.toString() || '')
                setSemester(user.studentProfile.semester || '')
            }
            // set teacher profile data
            if(user.role == 'teacher' && user.teacherProfile){
                setCourses(user.teacherProfile.coursesTeaching || '')
                setDepartment(user.teacherProfile.department || '')
            }
        }
    }
    // Fetch user data when editing
    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id])

    // register function 
    const register = async (e) => {
        e.preventDefault();
        try {
            const data = {
                name,
                email,
                role
            }

            if (password.trim() !== '') {
                data.password = password
            }
            //student profile
            if (role == "student") {
                data.studentProfile = {
                    major,
                    semester,
                    studentRollNumber: Number(rollNo),
                    year: Number(year)
                }
            }
            //teacher profile
            if (role == "teacher") {
                data.teacherProfile = {
                    department,
                    coursesTeaching: courses
                        .split(",")
                        .map(c => c.trim())
                        .filter(Boolean)
                }
            }
            let res;
            if (isEditing) {
                // Update existing user
                res = await axios.patch(`http://localhost:3000/api/user/update/${id}`, data, {
                    withCredentials: true
                })
            } else {
                // Create new user
                res = await axios.post("http://localhost:3000/api/register", data, {
                    withCredentials: true
                })
            }
            if (res.status == 200) {
                navigate('/admin/dashboard')
                // dispatch({ type: "SIGNIN", payload: res.data.user })
            }
            console.log(res);

        } catch (e) {
            if (e.response?.data?.errors) {
                setError(e.response.data.errors);
            }
        }
    }

    return (
        <div className="page">
            <div className="register-card">
                <h2 className="title">Register</h2>

                <form onSubmit={register} className="form">
                    {/* Full Name */}
                    <div className="field">
                        <label>Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Name" />
                    </div>

                    {/* Email */}
                    <div className="field">
                        <label>Email Address</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
                    </div>

                    {/* Password */}
                    <div className="field">
                        <label>Password</label>
                        <input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            type="password"
                            placeholder={isEditing ? "Leave empty to keep current password" : "password"}
                            required={!isEditing}
                        />
                        {isEditing && (
                            <small className="hint">Leave empty if you don't want to change the password</small>
                        )}
                    </div>

                    {/* Role */}
                    <div className="field">
                        <label>Select Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>
                    </div>

                    {/* Teacher Fields */}
                    {role === "teacher" && (
                        <div className="extra-section">
                            <div className="field">
                                {/* courses  */}
                                <label>Courses</label>
                                <input value={courses} onChange={e => setCourses(e.target.value)} type="text" placeholder="IT-41014,IT-31099,..." />
                            </div>

                            <div className="field">
                                {/* major  */}
                                <label>Department</label>
                                <select value={department} onChange={e => setDepartment(e.target.value)}>
                                    <option value="" disabled>
                                        Select Department
                                    </option>
                                    <option value="Civil">Civil Engineering</option>
                                    <option value="Archi">Architecture Engineering</option>
                                    <option value="Ec">Electronic Engineering</option>
                                    <option value="Ep">Electrical Engineering</option>
                                    <option value="Mech">Mechnical Engineering</option>
                                    <option value="IT">Information Technology Engineering</option>
                                    <option value="Mc">Mechatronic Engineering</option>
                                    <option value="Che">Chemical Engineering</option>
                                    <option value="Min">Mining Engineering</option>
                                    <option value="Pt">Petroleum Engineering</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Student Fields */}
                    {role === "student" && (
                        <div className="extra-section">
                            <div className="field">
                                {/* year */}
                                <label>Year</label>
                                <select value={year} onChange={e => setYear(e.target.value)}>
                                    <option value="" disabled>
                                        Select Year
                                    </option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                    <option value="5">5th Year</option>
                                    <option value="6">6th Year</option>
                                </select>
                            </div>

                            <div className="field">
                                {/* semester  */}
                                <label>Semester</label>
                                <select value={semester} onChange={e => setSemester(e.target.value)}>
                                    <option value="">Select Semester</option>
                                    <option value="first">First Semester</option>
                                    <option value="second">Second Semester</option>
                                </select>
                            </div>

                            <div className="field">
                                {/* major  */}
                                <label>Major</label>
                                <select value={major} onChange={e => setMajor(e.target.value)}>
                                    <option value="" disabled>
                                        Select Major
                                    </option>
                                    <option value="Civil">Civil Engineering</option>
                                    <option value="Archi">Architecture Engineering</option>
                                    <option value="Ec">Electronic Engineering</option>
                                    <option value="Ep">Electrical Engineering</option>
                                    <option value="Mech">Mechnical Engineering</option>
                                    <option value="IT">Information Technology Engineering</option>
                                    <option value="Mc">Mechatronic Engineering</option>
                                    <option value="Che">Chemical Engineering</option>
                                    <option value="Min">Mining Engineering</option>
                                    <option value="Pt">Petroleum Engineering</option>
                                </select>
                            </div>

                            <div className="field">
                                {/* roll number  */}
                                <label>Roll No.</label>
                                <input value={rollNo} onChange={e => setRollNo(e.target.value)} type="text" placeholder="Type Roll No." />
                            </div>
                        </div>
                    )}

                    <button type='submit' className="submit-btn">Create Account</button>
                </form>
            </div>
        </div>
    )
}

export default CreateAcc