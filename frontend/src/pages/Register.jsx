import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await API.post('register/', { username, email, password });
            setMessage('Account created! Redirecting to login...');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setMessage('Registration failed. Try a different username.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>HireSmart</h2>
                <p style={styles.subtitle}>Create your account</p>
                {message && <p style={styles.message}>{message}</p>}
                <input
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button style={styles.button} onClick={handleRegister}>
                    Register
                </button>
                <p style={styles.link}>
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '360px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
    title: { textAlign: 'center', color: '#2c3e50', marginBottom: '4px' },
    subtitle: { textAlign: 'center', color: '#888', marginBottom: '24px' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
    message: { color: 'green', textAlign: 'center', marginBottom: '12px' },
    link: { textAlign: 'center', marginTop: '16px', fontSize: '14px' }
};