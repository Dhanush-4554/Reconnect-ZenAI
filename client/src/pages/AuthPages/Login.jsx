import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './authStyles.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
    let inactivityTimer;

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer) clearTimeout(inactivityTimer);

        inactivityTimer = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIMEOUT);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        console.log("Logged out due to inactivity");
        navigate('/Login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', { username, password });
            if (response.status === 200) {
                console.log("Login successful");
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('username', username);
                resetInactivityTimer();
                navigate('/community');
            }
        } catch (error) {
            setErrorMessage('Invalid username or password');
        }
    };

    useEffect(() => {
        const handleUserActivity = () => {
            resetInactivityTimer();
        };

        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);

        return () => {
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
        };
    }, [resetInactivityTimer]);

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="login-input"
                    />
                </div>
                <div className="input-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="login-input"
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default Login;
