// userContext.js - Updated for HTTP-only cookies
import { createContext, useEffect, useReducer } from "react";
import axios from 'axios';

const UserContext = createContext();

// Configure axios defaults
axios.defaults.withCredentials = true; // This sends cookies with every request

let AuthenticationReducer = (state, action) => {
    switch (action.type) {
        case "SIGNIN": 
            return { 
                user: action.payload,
                isAuthenticated: true,
                loading: false
            };
        case "LOGOUT": 
            return { 
                user: null,
                isAuthenticated: false,
                loading: false
            };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        default: 
            return state;
    }
};

const UserContextProvider = ({ children }) => {
    let [state, dispatch] = useReducer(AuthenticationReducer, { 
        user: null, 
        isAuthenticated: false,
        loading: true 
    });

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // This will use the HTTP-only cookie automatically
                const response = await axios.get('http://localhost:3000/api/me');
                
                if (response.data.user) {
                    dispatch({ type: "SIGNIN", payload: response.data.user });
                } else {
                    dispatch({ type: "LOGOUT" });
                }
            } catch (error) {
                console.log('Not authenticated:', error.response?.data?.error);
                dispatch({ type: "LOGOUT" });
            }
        };
        
        verifyAuth();
    }, []);

    return (
        <UserContext.Provider value={{ ...state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserContextProvider };