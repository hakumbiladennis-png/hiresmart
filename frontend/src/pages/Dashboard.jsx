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
    const [biasWarnings, setBiasWarnings] = useState([]);
    const [showBiasModal, setShowBiasModal] = useState(false);
    const [messageType, setMessageType] = useState('success');
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
        fetchStats();
     }, []);

    const fetchJobs = async () => {
        try {
            const res = await API.get('jobs/');
            setJobs(res.data);
        } catch (err) {
            navigate('/');
        }
    };
    const fetchStats = async () => {
    try {
        const res = await API.get('stats/');
        setStats(res.data);
    } catch (err) {
        console.log('Stats error:', err);
    }
    };
    const createJob = async () => {
        if (!title || !description || !requiredSkills || !deadline) {
            setMessage('Please fill in all required fields.');
            setMessageType('error');
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

            if (res.data.bias_detected) {
                setBiasWarnings(res.data.bias_warnings);
                setShowBiasModal(true);
            }

            setMessage('Job created successfully!');
            setMessageType('success');
            setShowForm(false);
            setTitle(''); setDescription(''); setRequiredSkills('');
            setRequiredExperience(0); setLocation(''); setDeadline('');
            fetchJobs();
        } catch (err) {
            setMessage('Failed to create job. Please try again.');
            setMessageType('error');
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
            {showBiasModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>⚠️ Bias Warning Detected</h3>
                        </div>
                        <p style={styles.modalText}>
                            Your job post was created successfully, but the following potentially
                            biased language was detected. Consider revising your job description
                            to ensure fair and inclusive hiring.
                        </p>
                        {biasWarnings.map((warning, i) => (
                            <div key={i} style={styles.warningBox}>
                                <p style={styles.warningCategory}>
                                    {warning.category.replace('_', ' ').toUpperCase()} BIAS
                                </p>
                                <div style={styles.termsList}>
                                    {warning.terms.map((term, j) => (
                                        <span key={j} style={styles.termBadge}>{term}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            style={styles.modalBtn}
                            onClick={() => setShowBiasModal(false)}>
                            I Understand, Continue
                        </button>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <h2 style={styles.logo}>HireSmart</h2>
                <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </div>

            <div style={styles.container}>
                {stats && (
    <div style={styles.statsRow}>
        <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.total_jobs}</p>
            <p style={styles.statLabel}>Total Jobs</p>
        </div>
        <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.open_jobs}</p>
            <p style={styles.statLabel}>Open Jobs</p>
        </div>
        <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.total_applicants}</p>
            <p style={styles.statLabel}>Total Applicants</p>
        </div>
        <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.shortlisted}</p>
            <p style={styles.statLabel}>Shortlisted</p>
        </div>
        <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.pending}</p>
            <p style={styles.statLabel}>Pending Review</p>
        </div>
    </div>
)}
                <div style={styles.topBar}>
                    <h3 style={styles.sectionTitle}>Your Job Posts</h3>
                    <button style={styles.newJobBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Job Post'}
                    </button>
                </div>

                {message && (
                    <p style={messageType === 'error' ? styles.errorMsg : styles.message}>
                        {message}
                    </p>
                )}

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
                                    {job.applicant_count > 0 && (
                                 <span> &nbsp;|&nbsp; 🏆 Top Score: <strong>{job.top_score}%</strong></span>
                                 )}
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
    errorMsg: { color: 'red', marginBottom: '12px' },
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
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '480px', maxWidth: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
    modalHeader: { display: 'flex', alignItems: 'center', marginBottom: '16px' },
    modalTitle: { margin: 0, color: '#e67e22', fontSize: '18px' },
    modalText: { color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' },
    warningBox: { backgroundColor: '#fef9e7', border: '1px solid #f39c12', borderRadius: '8px', padding: '12px', marginBottom: '12px' },
    warningCategory: { margin: '0 0 8px', color: '#e67e22', fontWeight: '600', fontSize: '12px' },
    termsList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    termBadge: { backgroundColor: '#fadbd8', color: '#e74c3c', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '500' },
    modalBtn: { width: '100%', padding: '12px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', marginTop: '8px' },
    statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
    statCard: { flex: 1, minWidth: '120px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
    statNum: { margin: '0 0 4px', fontSize: '28px', fontWeight: '700', color: '#2c3e50' },
    statLabel: { margin: 0, fontSize: '12px', color: '#888', fontWeight: '500' },
};