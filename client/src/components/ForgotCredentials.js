import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import './ForgotCredentials.css';

function ForgotCredentials() {
    const { getPasswordByCredentials } = useAuth();
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({ username: "", email: "" });
    const [result, setResult] = useState(null); // { password } or null
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError("");
        setResult(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const res = getPasswordByCredentials(credentials);
        if (res.success) {
            setResult(res.password);
        } else {
            setError(res.message);
        }
    };

    return (
        <div className='body3'>
            <div className="resetPass">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="check" aria-hidden="true">Recover Password</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Find My Password</button>
                </form>

                {error && <p className="errorMsg" style={{ color: "#e74c3c", marginTop: "10px" }}>{error}</p>}

                {result && (
                    <div className="recoveredPassword">
                        <p>Your password is:</p>
                        <strong>{result}</strong>
                        <br /><br />
                        <button onClick={() => navigate("/login")}>Go to Login</button>
                    </div>
                )}

                {!result && (
                    <p>(Enter your username and email to recover your password.)</p>
                )}
            </div>
        </div>
    );
}

export default ForgotCredentials;
