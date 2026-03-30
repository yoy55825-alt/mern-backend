import { FaUserGraduate, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import './Management.css'
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
function StudentManagement() {
  const [data,setData]=useState([])
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate=useNavigate()
  // get student data 
  const getStudents=async()=>{
    let res=await axios.get(`${API_URL}/api/index`)
    console.log(res.data);
    const users=res.data
    const studentData=users.filter(user=>user.role=='student')

    console.log(studentData);
    setData(studentData)
  }

  // delete student data 
  const deleteStudent =async(id)=>{
    let res=await axios.delete(`${API_URL}/api/user/delete/`+id)
    if(res.status==200){
        setData(prevData => prevData.filter(student => student._id !== id))
    }
  }


  useEffect(()=>{
    getStudents()
  },[])

  return (
    <div className="centered-container"> {/* Add this wrapper */}
      <div className="box">
        <div className="box-header">
          <h3>
            <FaUserGraduate /> Student Management
          </h3>
          <Link to={'/admin/createAcc'} className="add-btn">
            <FaPlus /> Add Student
          </Link>
        </div>

        {/* TABLE HEADER */}
        <div className="table-header">
          <span>Name</span>
          <span>Year</span>
          <span>Major</span>
          <span>Roll No.</span>
          <span>Actions</span>
        </div>

        {/* STUDENT LIST */}
        <ul className="list">
          {data.map((student, index) => (
            <li key={index} className="list-item grid-row">
              <span>{student.name}</span>
              <span>{student.studentProfile.year}</span>
              <span>{student.studentProfile.major}</span>
              <span>{student.studentProfile.studentRollNumber}</span>
              

              <div className="action-buttons">
                <Link to={'/admin/studentUpdate/' +student._id }  className="edit-btn">
                  <FaEdit />
                </Link>
                <button onClick={()=>deleteStudent(student._id)} className="delete-btn">
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

export default StudentManagement;