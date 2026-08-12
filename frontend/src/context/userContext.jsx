// userContext.js - Updated for HTTP-only cookies
import { createContext, useEffect, useReducer } from "react";
import axios from 'axios';

const UserContext = createContext();

// Configure axios defaults
axios.defaults.withCredentials = true; // This sends cookies with every request
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TAB_SESSION_KEY = 'taskwave-tab-session';

let AuthenticationReducer = (state, action) => {
    switch (action.type) {
        case "SIGNIN": 
            sessionStorage.setItem(TAB_SESSION_KEY, 'active');
            return { 
                user: action.payload,
                isAuthenticated: true,
                loading: false
            };
        case "LOGOUT": 
            sessionStorage.removeItem(TAB_SESSION_KEY);
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
            // sessionStorage survives reloads, but the browser removes it when
            // this tab is closed. Do not restore a cookie-based login in a new tab.
            if (!sessionStorage.getItem(TAB_SESSION_KEY)) {
                dispatch({ type: "LOGOUT" });
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/api/me`,{
                    withCredentials : true
                });
                
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
