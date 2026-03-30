import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Router from "./Routes/router.jsx"
import {  UserContextProvider } from './context/userContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <Router/>
    </UserContextProvider>
  </StrictMode>,
)
