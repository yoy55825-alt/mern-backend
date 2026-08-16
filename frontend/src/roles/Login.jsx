import React, { useContext } from "react";
import './Login.css';
import { FaEnvelope, FaSignInAlt, FaLock } from "react-icons/fa";
import { useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router";
import { UserContext } from "../context/userContext";

const Login = () => {
    let { dispatch } = useContext(UserContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // const API_URL = process.env.VITE_API_URL;

    const Login = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const data = { email, password };
            const res = await axios.post(`${API_URL}/api/login`, data,{
                withCredentials : true
            });
            
            console.log(res.data);
            
            if (res.status === 200) {
                dispatch({ type: "SIGNIN", payload: res.data.user });
                
                // Navigate based on role
                if (res.data.user.role === 'student') {
                    navigate('/student/dashboard');
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
                <div className="login-brand"><img src="/webicon7.png" alt="TaskWave logo" /><span>TaskWave</span></div>
                <p className="login-kicker">Welcome back</p>
                <h2 className="login-title">Sign in to continue</h2>
                <p className="login-subtitle">Access assignments, submissions, and your workspace.</p>

                {error && <div className="error-message">{error}</div>}

                <div className="input-group">
                    <FaEnvelope className="icon" />
                    <input 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        type="email" 
                        placeholder="Email address"
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
                    <FaSignInAlt /> Sign in
                </button>
                <div className="login-divider"><span>or</span></div>
                <Link className="guest-login-link" to="/guest/welcome">
                    Explore as a guest
                </Link>
            </form>
        </div>
    );
};

export default Login;
