import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPanel from "./AdminPanel.jsx";

// Ak URL obsahuje /admin, zobraz AdminPanel
const isAdmin = window.location.pathname === "/admin";
ReactDOM.createRoot(document.getElementById("root")).render(
  isAdmin ? <AdminPanel /> : <App />
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
