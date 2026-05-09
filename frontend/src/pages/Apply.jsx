import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Apply() {
    const { publicId } = useParams();
    const [job, setJob] = useState(null);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState(0);
    const [currentJobTitle, setCurrentJobTitle] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [cvFile, setCvFile] = useState(null);

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/apply/${publicId}/`)
            .then(res => setJob(res.data))
            .catch(err => {
                if (err.response?.data?.error) {
                    setError(err.response.data.error);
                } else {
                    setError('Job not found or no longer available.');
                }
            });
    }, [publicId]);
    useEffect(() => {
    if (!job) return;
    const calculateTimeLeft = () => {
        const deadline = new Date(job.deadline);
        deadline.setHours(23, 59, 59, 999);
        const now = new Date();
        const diff = deadline - now;
        if (diff <= 0) {
            setTimeLeft('Applications closed');
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            if (days > 0) {
                setTimeLeft(`${days} day${days !== 1 ? 's' : ''} ${hours}h ${minutes}m ${seconds}s remaining`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s remaining`);
            }
        };
            calculateTimeLeft();
            const timer = setInterval(calculateTimeLeft, 1000);
            return () => clearInterval(timer);
        }, [job]);
    const handleSubmit = async () => {
        if (!fullName || !email || !phone || !location || !educationLevel || !cvFile) {
            setError('Please fill in all required fields and upload your CV.');
            return;
        }
        if (cvFile && cvFile.size > 5 * 1024 * 1024) {
            setError('CV file size must be under 5MB. Please compress your file and try again.');
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('location', location);
        formData.append('education_level', educationLevel);
        formData.append('years_of_experience', yearsOfExperience);
        formData.append('current_job_title', currentJobTitle);
        formData.append('cover_letter', coverLetter);
        formData.append('cv_file', cvFile);

        try {
            await axios.post(`http://127.0.0.1:8000/api/apply/${publicId}/submit/`, formData);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed. Please try again.');
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div style={styles.page}>
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>✓</div>
                    <h2 style={styles.successTitle}>Application Submitted!</h2>
                    <p style={styles.successText}>
                        Thank you for applying. Your application has been received and will be reviewed shortly. Good luck!
                    </p>
                </div>
            </div>
        );
    }

    if (error && !job) {
        return (
            <div style={styles.page}>
                <div style={styles.errorCard}>
                    <h2 style={styles.errorTitle}>Unavailable</h2>
                    <p style={styles.errorText}>{error}</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingCard}>
                    <p>Loading job details...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2 style={styles.logo}>HireSmart</h2>
            </div>

            <div style={styles.container}>
                <div style={styles.jobBanner}>
                    <h2 style={styles.jobTitle}>{job.title}</h2>
                    <p style={styles.jobMeta}>
                        📍 {job.location || 'Location not specified'} &nbsp;|&nbsp;
                        📅 Apply before: {job.deadline}
                    </p>
                    {timeLeft && (
                        <div style={timeLeft === 'Applications closed' ? styles.countdownClosed : styles.countdown}>
                            ⏰ {timeLeft}
                            </div>
                        )}
                    <p style={styles.jobDescription}>{job.description}</p>
                    <div style={styles.skillsRow}>
                        <span style={styles.skillsLabel}>Required Skills: </span>
                        {job.required_skills.split(',').map((skill, i) => (
                            <span key={i} style={styles.skillTag}>{skill.trim()}</span>
                        ))}
                    </div>
                    <p style={styles.expText}>
                        Experience Required: {job.required_experience_years} year{job.required_experience_years !== 1 ? 's' : ''}
                    </p>
                </div>

                <div style={styles.form}>
                    <h3 style={styles.formTitle}>Your Application</h3>
                    {error && <p style={styles.errorMsg}>{error}</p>}

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Full Name *</label>
                            <input style={styles.input} placeholder="e.g. John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Email Address *</label>
                            <input style={styles.input} type="email" placeholder="e.g. john@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Phone Number *</label>
                            <input style={styles.input} placeholder="e.g. +260 977 000 000" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Current Location *</label>
                            <input style={styles.input} placeholder="e.g. Lusaka, Zambia" value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Highest Education Level *</label>
                            <select style={styles.input} value={educationLevel} onChange={e => setEducationLevel(e.target.value)}>
                                <option value="">Select education level</option>
                                <option value="High School">High School</option>
                                <option value="Diploma">Diploma</option>
                                <option value="Bachelor's Degree">Bachelor's Degree</option>
                                <option value="Master's Degree">Master's Degree</option>
                                <option value="PhD">PhD</option>
                                <option value="Professional Certificate">Professional Certificate</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Years of Experience *</label>
                            <input style={styles.input} type="number" min="0" value={yearsOfExperience} onChange={e => setYearsOfExperience(e.target.value)} />
                        </div>
                    </div>

                    <div style={styles.fullField}>
                        <label style={styles.label}>Current or Most Recent Job Title</label>
                        <input style={styles.input} placeholder="e.g. Software Developer" value={currentJobTitle} onChange={e => setCurrentJobTitle(e.target.value)} />
                    </div>

                    <div style={styles.fullField}>
                        <label style={styles.label}>Cover Letter</label>
                        <textarea
                            style={styles.textarea}
                            placeholder="Tell us why you are a good fit for this role..."
                            value={coverLetter}
                            onChange={e => setCoverLetter(e.target.value)}
                        />
                    </div>

                    <div style={styles.fullField}>
                        <label style={styles.label}>Upload CV * (PDF or Word document)</label>
                        <input
                            style={styles.fileInput}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={e => setCvFile(e.target.files[0])}
                        />
                        <p style={styles.fileHint}>Accepted formats: PDF, DOCX</p>
                    </div>

                    <button
                        style={loading ? styles.btnLoading : styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={loading}>
                        {loading ? 'Submitting your application...' : 'Submit Application'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: { backgroundColor: 'white', padding: '16px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    logo: { margin: 0, color: '#2c3e50' },
    container: { maxWidth: '800px', margin: '32px auto', padding: '0 24px 40px' },
    jobBanner: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '4px solid #3498db' },
    jobTitle: { margin: '0 0 8px', color: '#2c3e50', fontSize: '22px' },
    jobMeta: { margin: '0 0 12px', color: '#888', fontSize: '14px' },
    jobDescription: { margin: '0 0 12px', color: '#555', fontSize: '14px', lineHeight: '1.6' },
    skillsRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '8px' },
    skillsLabel: { fontSize: '13px', color: '#666', fontWeight: '500' },
    skillTag: { backgroundColor: '#eaf4fb', color: '#2980b9', padding: '3px 10px', borderRadius: '10px', fontSize: '12px' },
    expText: { margin: 0, color: '#666', fontSize: '13px' },
    form: { backgroundColor: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
    formTitle: { margin: '0 0 20px', color: '#2c3e50' },
    errorMsg: { color: 'red', marginBottom: '16px', padding: '10px', backgroundColor: '#fadbd8', borderRadius: '6px' },
    row: { display: 'flex', gap: '16px', marginBottom: '4px' },
    field: { flex: 1 },
    fullField: { marginBottom: '4px' },
    label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: '500' },
    input: { width: '100%', padding: '11px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '11px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', height: '130px', boxSizing: 'border-box', resize: 'vertical' },
    fileInput: { width: '100%', padding: '11px', marginBottom: '4px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fafafa' },
    fileHint: { margin: '0 0 16px', fontSize: '12px', color: '#888' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '500' },
    btnLoading: { width: '100%', padding: '14px', backgroundColor: '#85c1e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed', fontWeight: '500' },
    successCard: { maxWidth: '500px', margin: '100px auto', backgroundColor: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
    successIcon: { width: '64px', height: '64px', backgroundColor: '#2ecc71', color: 'white', borderRadius: '50%', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
    successTitle: { color: '#2c3e50', marginBottom: '12px' },
    successText: { color: '#666', lineHeight: '1.6' },
    errorCard: { maxWidth: '500px', margin: '100px auto', backgroundColor: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
    errorTitle: { color: '#e74c3c', marginBottom: '12px' },
    errorText: { color: '#666' },
    loadingCard: { maxWidth: '500px', margin: '100px auto', backgroundColor: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center' },
    countdown: { display: 'inline-block', marginTop: '8px', backgroundColor: '#eaf4fb', color: '#2980b9', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
    countdownClosed: { display: 'inline-block', marginTop: '8px', backgroundColor: '#fadbd8', color: '#e74c3c', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
};