import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function UploadResume() {
    const [jobs, setJobs] = useState([]);
    const [jobId, setJobId] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [score, setScore] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.get('jobs/').then(res => setJobs(res.data)).catch(() => navigate('/'));
    }, []);

    const handleUpload = async () => {
        if (!jobId || !candidateName || !file) {
            setMessage('Please fill in all fields and select a file.');
            return;
        }
        const formData = new FormData();
        formData.append('job_id', jobId);
        formData.append('candidate_name', candidateName);
        formData.append('resume_file', file);
        try {
            const res = await API.post('upload-resume/', formData);
            setScore(res.data.score);
            setMessage(`Resume uploaded! Match score: ${(res.data.score * 100).toFixed(1)}%`);
        } catch (err) {
            setMessage('Upload failed. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Upload Resume</h2>
                    <Link to="/dashboard" style={styles.backBtn}>Back to Dashboard</Link>
                </div>
                {message && <p style={score !== null ? styles.success : styles.error}>{message}</p>}
                <select style={styles.input} value={jobId} onChange={e => setJobId(e.target.value)}>
                    <option value="">Select a Job</option>
                    {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>
                <input style={styles.input} placeholder="Candidate Name" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
                <input style={styles.input} type="file" accept=".pdf,.docx" onChange={e => setFile(e.target.files[0])} />
                <button style={styles.button} onClick={handleUpload}>Upload & Score</button>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { margin: 0, color: '#2c3e50' },
    backBtn: { color: '#3498db', textDecoration: 'none', fontSize: '14px' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
    success: { color: 'green', marginBottom: '12px' },
    error: { color: 'red', marginBottom: '12px' }
};