import { FaChalkboardTeacher, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import './Management.css'
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
function TeacherManagement() {
    const [data, setData] = useState([])
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    //get teachers' data
    const getTeachers = async () => {
        const res = await axios.get(`${API_URL}/api/index`)
        const users = res.data

        const teacherData = users.filter(user => user.role == 'teacher')
        console.log(teacherData);
        setData(teacherData)

    }
    // delete teachers data 
    const deleteTeacher = async (id) => {
        let res = await axios.delete(`${API_URL}/api/user/delete/` + id)
        if (res.status == 200) {
            setData(prevData => prevData.filter(teacher => teacher._id !== id))
        }
    }
    useEffect(() => {
        getTeachers()
    }, [])

    return (
        <div className="centered-container">
            <div className="box">
                <div className="box-header">
                    <h3>
                        <FaChalkboardTeacher /> Teacher Management
                    </h3>
                    <Link to={'/admin/createAcc'} className="add-btn">
                        <FaPlus /> Add Teacher
                    </Link>
                </div>

                {/* TABLE HEADER */}
                <div className="table-header teacher-header">
                    <span>Name</span>
                    <span>Department</span>
                    <span>Courses</span>
                    <span>Actions</span>
                </div>

                {/* TEACHER LIST */}
                <ul className="list">
                    {data.map((teacher, index) => (
                        <li key={index} className="list-item teacher-row">
                            <span>{teacher.name}</span>
                            <span>{teacher.teacherProfile.department}</span>
                            <span>{teacher.teacherProfile.coursesTeaching.join(', ')}</span>

                            <div className="action-buttons">
                                <Link to={'/admin/teacherUpdate/' + teacher._id} className="edit-btn">
                                    <FaEdit />
                                </Link>
                                <button onClick={() => deleteTeacher(teacher._id)} className="delete-btn">
                                    <FaTrash />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default TeacherManagement;
