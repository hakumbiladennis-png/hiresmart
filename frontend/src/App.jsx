import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobApplicants from './pages/JobApplicants';
import PasswordReset from './pages/PasswordReset';
import Apply from './pages/Apply';

export default function App() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.body.style.backgroundColor = '#1a1a2e';
            document.body.style.color = '#eee';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.style.backgroundColor = '#f0f2f5';
            document.body.style.color = '#2c3e50';
        }
    }, [darkMode]);

    return (
        <Router>
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
            }}>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                        backgroundColor: darkMode ? '#f39c12' : '#2c3e50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '24px',
                        padding: '10px 20px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease',
                    }}>
                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs/:jobId" element={<JobApplicants />} />
                <Route path="/apply/:publicId" element={<Apply />} />
                <Route path="/reset-password" element={<PasswordReset />} />
            </Routes>
        </Router>
    );
}