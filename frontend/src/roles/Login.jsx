import React, { useContext } from "react";
import './Login.css';
import { FaUser, FaEnvelope, FaSignInAlt, FaLock } from "react-icons/fa";
import { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router";
import { UserContext } from "../context/userContext";

const Login = () => {
    let { dispatch } = useContext(UserContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

    const Login = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const data = { email, password };
            const res = await axios.post(`${API_URL}/api/login`, data);
            
            console.log(res.data);
            
            if (res.status === 200) {
                dispatch({ type: "SIGNIN", payload: res.data.user });
                
                // Navigate based on role
                if (res.data.user.role === 'student') {
                    navigate('/student/assignmentList');
                } else if (res.data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/teacher/assignment/questionType');
                }
            }
        } catch (e) {
            const errorMessage = e.response?.data?.error || "Login failed";
            setError(errorMessage);
            console.log(errorMessage);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={Login} className="login-box">
                <FaUser className="logo-icon" />
                <h2 className="login-title">Login</h2>

                {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

                <div className="input-group">
                    <FaEnvelope className="icon" />
                    <input 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        type="email" 
                        placeholder="Email" 
                        required 
                    />
                </div>

                <div className="input-group">
                    <FaLock className="icon" />
                    <input 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        type="password" 
                        placeholder="Password" 
                        required 
                    />
                </div>

                <button className="login-btn" type="submit">
                    <FaSignInAlt /> Submit
                </button>
            </form>
        </div>
    );
};

export default Login;