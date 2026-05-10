import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function PasswordReset() {
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async () => {
        setError('');
        setMessage('');

        if (!username || !currentPassword || !newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from your current password.');
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('password-reset/', {
                username,
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setMessage(res.data.message);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>HireSmart</h2>
                <p style={styles.subtitle}>Change Your Password</p>

                {error && <p style={styles.error}>{error}</p>}
                {message && <p style={styles.success}>{message}</p>}

                <label style={styles.label}>Username</label>
                <input
                    style={styles.input}
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />

                <label style={styles.label}>Current Password</label>
                <input
                    style={styles.input}
                    placeholder="Enter your current password"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                />

                <label style={styles.label}>New Password</label>
                <input
                    style={styles.input}
                    placeholder="Enter your new password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                />

                <label style={styles.label}>Confirm New Password</label>
                <input
                    style={styles.input}
                    placeholder="Confirm your new password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />

                <button
                    style={loading ? styles.btnLoading : styles.button}
                    onClick={handleReset}
                    disabled={loading}>
                    {loading ? 'Changing Password...' : 'Change Password'}
                </button>

                <p style={styles.link}>
                    Remember your password? <Link to="/">Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '380px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
    title: { textAlign: 'center', color: '#2c3e50', marginBottom: '4px' },
    subtitle: { textAlign: 'center', color: '#888', marginBottom: '24px' },
    label: { display: 'block', fontSize: '13px', color: '#555', fontWeight: '500', marginBottom: '6px' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '4px' },
    btnLoading: { width: '100%', padding: '12px', backgroundColor: '#85c1e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed', marginTop: '4px' },
    error: { color: '#e74c3c', textAlign: 'center', marginBottom: '12px', padding: '10px', backgroundColor: '#fadbd8', borderRadius: '6px', fontSize: '14px' },
    success: { color: '#27ae60', textAlign: 'center', marginBottom: '12px', padding: '10px', backgroundColor: '#d5f5e3', borderRadius: '6px', fontSize: '14px' },
    link: { textAlign: 'center', marginTop: '16px', fontSize: '14px' },
};