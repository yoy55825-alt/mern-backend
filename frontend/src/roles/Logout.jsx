// Logout.js
import { useContext } from "react";
import axios from 'axios';
import { useNavigate } from "react-router";
import { UserContext } from "../context/userContext";

const Logout = () => {
    const { dispatch } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3000/api/logout');
            dispatch({ type: "LOGOUT" });
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <button onClick={handleLogout} className="logout-btn">
            Logout
        </button>
    );
};

export default Logout;