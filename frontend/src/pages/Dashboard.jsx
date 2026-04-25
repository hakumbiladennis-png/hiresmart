import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Dashboard() {
    const [jobs, setJobs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [requiredExperience, setRequiredExperience] = useState(0);
    const [location, setLocation] = useState('');
    const [deadline, setDeadline] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        try {
            const res = await API.get('jobs/');
            setJobs(res.data);
        } catch (err) {
            navigate('/');
        }
    };

    const createJob = async () => {
        if (!title || !description || !requiredSkills || !deadline) {
            setMessage('Please fill in all required fields.');
            return;
        }
        try {
            const res = await API.post('jobs/', {
                title,
                description,
                required_skills: requiredSkills,
                required_experience_years: requiredExperience,
                location,
                deadline,
            });
            setMessage('Job created successfully!');
            setShowForm(false);
            setTitle(''); setDescription(''); setRequiredSkills('');
            setRequiredExperience(0); setLocation(''); setDeadline('');
            fetchJobs();
        } catch (err) {
            setMessage('Failed to create job. Please try again.');
        }
    };

    const toggleJobStatus = async (jobId, currentStatus) => {
        const newStatus = currentStatus === 'open' ? 'closed' : 'open';
        await API.patch(`jobs/${jobId}/`, { status: newStatus });
        fetchJobs();
    };

    const copyLink = (publicId) => {
        const link = `${window.location.origin}/apply/${publicId}`;
        navigator.clipboard.writeText(link);
        alert('Application link copied! You can now share it on WhatsApp, Facebook, etc.');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2 style={styles.logo}>HireSmart</h2>
                <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </div>

            <div style={styles.container}>
                <div style={styles.topBar}>
                    <h3 style={styles.sectionTitle}>Your Job Posts</h3>
                    <button style={styles.newJobBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Job Post'}
                    </button>
                </div>

                {message && <p style={styles.message}>{message}</p>}

                {showForm && (
                    <div style={styles.form}>
                        <h4 style={styles.formTitle}>Create New Job Post</h4>
                        <input style={styles.input} placeholder="Job Title *" value={title} onChange={e => setTitle(e.target.value)} />
                        <textarea style={styles.textarea} placeholder="Job Description * (Describe the role, responsibilities, requirements)" value={description} onChange={e => setDescription(e.target.value)} />
                        <input style={styles.input} placeholder="Required Skills * (e.g. Python, Django, PostgreSQL)" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} />
                        <input style={styles.input} placeholder="Location (e.g. Lusaka, Zambia)" value={location} onChange={e => setLocation(e.target.value)} />
                        <div style={styles.row}>
                            <div style={styles.halfField}>
                                <label style={styles.label}>Years of Experience Required *</label>
                                <input style={styles.input} type="number" min="0" value={requiredExperience} onChange={e => setRequiredExperience(e.target.value)} />
                            </div>
                            <div style={styles.halfField}>
                                <label style={styles.label}>Application Deadline *</label>
                                <input style={styles.input} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                            </div>
                        </div>
                        <button style={styles.submitBtn} onClick={createJob}>Create Job Post</button>
                    </div>
                )}

                {jobs.length === 0 && !showForm && (
                    <div style={styles.empty}>
                        <p>No job posts yet. Click "New Job Post" to get started.</p>
                    </div>
                )}

                {jobs.map(job => (
                    <div key={job.id} style={styles.jobCard}>
                        <div style={styles.jobTop}>
                            <div>
                                <h4 style={styles.jobTitle}>{job.title}</h4>
                                <p style={styles.jobMeta}>
                                    📍 {job.location || 'Location not specified'} &nbsp;|&nbsp;
                                    📅 Deadline: {job.deadline} &nbsp;|&nbsp;
                                    👥 {job.applicant_count} applicant{job.applicant_count !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <span style={job.status === 'open' ? styles.badgeOpen : styles.badgeClosed}>
                                {job.status === 'open' ? 'Open' : 'Closed'}
                            </span>
                        </div>
                        <div style={styles.jobActions}>
                            <button style={styles.actionBtn} onClick={() => navigate(`/jobs/${job.id}`)}>
                                View Applicants
                            </button>
                            <button style={styles.copyBtn} onClick={() => copyLink(job.public_id)}>
                                Copy Application Link
                            </button>
                            <button
                                style={job.status === 'open' ? styles.closeBtn : styles.openBtn}
                                onClick={() => toggleJobStatus(job.id, job.status)}>
                                {job.status === 'open' ? 'Close Job' : 'Reopen Job'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    page: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: { backgroundColor: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    logo: { color: '#2c3e50', margin: 0 },
    logoutBtn: { backgroundColor: '#e74c3c', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' },
    container: { maxWidth: '900px', margin: '32px auto', padding: '0 24px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    sectionTitle: { margin: 0, color: '#2c3e50' },
    newJobBtn: { backgroundColor: '#3498db', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' },
    form: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
    formTitle: { margin: '0 0 16px', color: '#2c3e50' },
    input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', height: '120px', boxSizing: 'border-box', resize: 'vertical' },
    row: { display: 'flex', gap: '16px' },
    halfField: { flex: 1 },
    label: { display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' },
    submitBtn: { backgroundColor: '#2ecc71', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' },
    message: { color: 'green', marginBottom: '12px' },
    empty: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#888' },
    jobCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
    jobTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
    jobTitle: { margin: '0 0 4px', color: '#2c3e50', fontSize: '16px' },
    jobMeta: { margin: 0, color: '#888', fontSize: '13px' },
    badgeOpen: { backgroundColor: '#d5f5e3', color: '#1e8449', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
    badgeClosed: { backgroundColor: '#fadbd8', color: '#922b21', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
    jobActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    actionBtn: { backgroundColor: '#3498db', color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    copyBtn: { backgroundColor: '#9b59b6', color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    closeBtn: { backgroundColor: '#e74c3c', color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    openBtn: { backgroundColor: '#2ecc71', color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
};