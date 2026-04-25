import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobApplicants from './pages/JobApplicants';
import Apply from './pages/Apply';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs/:jobId" element={<JobApplicants />} />
                <Route path="/apply/:publicId" element={<Apply />} />
            </Routes>
        </Router>
    );
}