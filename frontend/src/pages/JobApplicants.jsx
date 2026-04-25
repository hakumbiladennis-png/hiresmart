import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';

export default function JobApplicants() {
    const { jobId } = useParams();
    const [jobData, setJobData] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchApplicants(); }, []);

    const fetchApplicants = async () => {
        try {
            const res = await API.get(`jobs/${jobId}/applicants/`);
            setJobData(res.data);
        } catch (err) {
            navigate('/');
        }
    };

    const updateStatus = async (applicantId, newStatus) => {
        await API.patch(`applicants/${applicantId}/`, { status: newStatus });
        setMessage('Status updated successfully!');
        fetchApplicants();
        if (selectedApplicant?.id === applicantId) {
            setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
        }
    };

    const exportCSV = () => {
        window.open(`http://127.0.0.1:8000/api/jobs/${jobId}/export/`, '_blank');
    };

    const getStatusStyle = (status) => {
        if (status === 'shortlisted') return styles.badgeShortlisted;
        if (status === 'rejected') return styles.badgeRejected;
        return styles.badgePending;
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
                    <h2 style={styles.logo}>HireSmart</h2>
                </div>
                <button style={styles.exportBtn} onClick={exportCSV}>Download CSV Report</button>
            </div>

            <div style={styles.container}>
                {jobData && (
                    <>
                        <div style={styles.jobHeader}>
                            <h3 style={styles.jobTitle}>{jobData.job_title}</h3>
                            <p style={styles.jobMeta}>{jobData.applicants.length} applicant{jobData.applicants.length !== 1 ? 's' : ''} — ranked by match score</p>
                        </div>

                        {message && <p style={styles.message}>{message}</p>}

                        <div style={styles.layout}>
                            <div style={styles.list}>
                                {jobData.applicants.length === 0 && (
                                    <div style={styles.empty}>No applicants yet.</div>
                                )}
                                {jobData.applicants.map((a) => (
                                    <div
                                        key={a.id}
                                        style={{
                                            ...styles.applicantCard,
                                            ...(selectedApplicant?.id === a.id ? styles.selectedCard : {})
                                        }}
                                        onClick={() => setSelectedApplicant(a)}>
                                        <div style={styles.cardTop}>
                                            <div>
                                                <p style={styles.rank}>#{a.rank}</p>
                                                <p style={styles.name}>{a.full_name}</p>
                                                <p style={styles.meta}>{a.current_job_title || 'No title provided'}</p>
                                                <p style={styles.meta}>{a.years_of_experience} year{a.years_of_experience !== 1 ? 's' : ''} experience</p>
                                            </div>
                                            <div style={styles.scoreBox}>
                                                <p style={styles.scoreNum}>{a.score}%</p>
                                                <p style={styles.scoreLabel}>match</p>
                                            </div>
                                        </div>
                                        <div style={styles.cardBottom}>
                                            <span style={getStatusStyle(a.status)}>{a.status}</span>
                                            <div style={styles.skillTags}>
                                                {a.matched_skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} style={styles.skillTag}>{skill}</span>
                                                ))}
                                                {a.matched_skills.length > 3 && (
                                                    <span style={styles.skillTag}>+{a.matched_skills.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedApplicant && (
                                <div style={styles.detail}>
                                    <div style={styles.detailHeader}>
                                        <h4 style={styles.detailName}>{selectedApplicant.full_name}</h4>
                                        <button style={styles.closeDetail} onClick={() => setSelectedApplicant(null)}>✕</button>
                                    </div>

                                    <div style={styles.detailSection}>
                                        <p style={styles.detailItem}>📧 {selectedApplicant.email}</p>
                                        <p style={styles.detailItem}>📞 {selectedApplicant.phone}</p>
                                        <p style={styles.detailItem}>📍 {selectedApplicant.location}</p>
                                        <p style={styles.detailItem}>🎓 {selectedApplicant.education_level}</p>
                                        <p style={styles.detailItem}>💼 {selectedApplicant.current_job_title || 'Not provided'}</p>
                                        <p style={styles.detailItem}>⏱ {selectedApplicant.years_of_experience} years experience</p>
                                    </div>

                                    <div style={styles.scoreSection}>
                                        <h5 style={styles.sectionLabel}>Match Score</h5>
                                        <div style={styles.scoreBar}>
                                            <div style={{ ...styles.scoreBarFill, width: `${selectedApplicant.score}%` }} />
                                        </div>
                                        <p style={styles.scoreText}>{selectedApplicant.score}% match</p>
                                    </div>

                                    <div style={styles.skillSection}>
                                        <h5 style={styles.sectionLabel}>Matched Skills ({selectedApplicant.matched_skills.length}/{selectedApplicant.total_skills})</h5>
                                        <div style={styles.skillTags}>
                                            {selectedApplicant.matched_skills.map((skill, i) => (
                                                <span key={i} style={styles.skillTagGreen}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedApplicant.cover_letter && (
                                        <div style={styles.coverSection}>
                                            <h5 style={styles.sectionLabel}>Cover Letter</h5>
                                            <p style={styles.coverText}>{selectedApplicant.cover_letter}</p>
                                        </div>
                                    )}

                                    <div style={styles.actionSection}>
                                        <h5 style={styles.sectionLabel}>Update Status</h5>
                                        <div style={styles.actionBtns}>
                                            <button
                                                style={styles.shortlistBtn}
                                                onClick={() => updateStatus(selectedApplicant.id, 'shortlisted')}>
                                                ✓ Shortlist
                                            </button>
                                            <button
                                                style={styles.rejectBtn}
                                                onClick={() => updateStatus(selectedApplicant.id, 'rejected')}>
                                                ✕ Reject
                                            </button>
                                            <button
                                                style={styles.pendingBtn}
                                                onClick={() => updateStatus(selectedApplicant.id, 'pending')}>
                                                ↺ Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: { backgroundColor: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
    backBtn: { backgroundColor: 'transparent', border: '1px solid #ddd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', color: '#555' },
    logo: { margin: 0, color: '#2c3e50' },
    exportBtn: { backgroundColor: '#27ae60', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' },
    container: { maxWidth: '1100px', margin: '32px auto', padding: '0 24px' },
    jobHeader: { marginBottom: '24px' },
    jobTitle: { margin: '0 0 4px', color: '#2c3e50', fontSize: '22px' },
    jobMeta: { margin: 0, color: '#888', fontSize: '14px' },
    message: { color: 'green', marginBottom: '12px' },
    layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
    list: { flex: 1, minWidth: 0 },
    empty: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#888' },
    applicantCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: '2px solid transparent' },
    selectedCard: { border: '2px solid #3498db' },
    cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    rank: { margin: '0 0 2px', color: '#888', fontSize: '12px' },
    name: { margin: '0 0 2px', fontWeight: '500', color: '#2c3e50', fontSize: '15px' },
    meta: { margin: '0 0 2px', color: '#888', fontSize: '13px' },
    scoreBox: { textAlign: 'center', backgroundColor: '#eaf4fb', padding: '8px 12px', borderRadius: '8px' },
    scoreNum: { margin: 0, color: '#2980b9', fontWeight: '700', fontSize: '18px' },
    scoreLabel: { margin: 0, color: '#7fb3d3', fontSize: '11px' },
    cardBottom: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
    badgePending: { backgroundColor: '#fef9e7', color: '#b7950b', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
    badgeShortlisted: { backgroundColor: '#d5f5e3', color: '#1e8449', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
    badgeRejected: { backgroundColor: '#fadbd8', color: '#922b21', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
    skillTags: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
    skillTag: { backgroundColor: '#eaf4fb', color: '#2980b9', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' },
    skillTagGreen: { backgroundColor: '#d5f5e3', color: '#1e8449', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' },
    detail: { width: '360px', flexShrink: 0, backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', position: 'sticky', top: '20px' },
    detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    detailName: { margin: 0, color: '#2c3e50', fontSize: '17px' },
    closeDetail: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' },
    detailSection: { marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' },
    detailItem: { margin: '0 0 6px', fontSize: '13px', color: '#555' },
    scoreSection: { marginBottom: '16px' },
    sectionLabel: { margin: '0 0 8px', color: '#2c3e50', fontSize: '13px', fontWeight: '500' },
    scoreBar: { backgroundColor: '#eee', borderRadius: '4px', height: '8px', marginBottom: '4px' },
    scoreBarFill: { backgroundColor: '#3498db', height: '8px', borderRadius: '4px' },
    scoreText: { margin: 0, fontSize: '13px', color: '#555' },
    skillSection: { marginBottom: '16px' },
    coverSection: { marginBottom: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' },
    coverText: { margin: 0, fontSize: '13px', color: '#555', lineHeight: '1.6' },
    actionSection: { borderTop: '1px solid #f0f0f0', paddingTop: '16px' },
    actionBtns: { display: 'flex', gap: '8px' },
    shortlistBtn: { backgroundColor: '#2ecc71', color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    rejectBtn: { backgroundColor: '#e74c3c', color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    pendingBtn: { backgroundColor: '#95a5a6', color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
};