import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import './index.css';

function LoginPage() {
    const { login, signUp } = useAuth();
    const navigate = useNavigate();

    // ── Login state ───────────────────────────────────────────────────────────
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        setLoginError("");
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        const result = await login(loginData);
        setLoginLoading(false);
        if (result.success) {
            alert("Login Successful!");
            navigate("/");
        } else {
            setLoginError(result.message);
        }
    };

    // ── SignUp state ──────────────────────────────────────────────────────────
    const [signUpData, setSignUpData] = useState({ username: "", email: "", password: "" });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [signUpError, setSignUpError] = useState("");
    const [signUpLoading, setSignUpLoading] = useState(false);

    const handleSignUpChange = (e) => {
        setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
        setSignUpError("");
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        if (signUpData.password !== confirmPassword) {
            setSignUpError("Passwords do not match!");
            return;
        }
        if (signUpData.password.length < 6) {
            setSignUpError("Password must be at least 6 characters.");
            return;
        }
        setSignUpLoading(true);
        const result = await signUp(signUpData);
        setSignUpLoading(false);
        if (result.success) {
            alert("Sign Up Successful! Now login with your new account.");
            navigate("/login");
        } else {
            setSignUpError(result.message);
        }
    };

    return (
        <div className='body1'>
            <div className="main1">
                <input type="checkbox" id="check1" aria-hidden="true" />

                {/* ── Login Panel ──────────────────────────────────────────── */}
                <div className="login1">
                    <form onSubmit={handleLoginSubmit}>
                        <label className='label1' htmlFor="check1" aria-hidden="true">Login</label>
                        <input
                            className='input1'
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={loginData.username}
                            onChange={handleLoginChange}
                            required
                        />
                        <input
                            className='input1'
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                        />
                        {loginError && <p className="errorMsg">{loginError}</p>}
                        <button className='button1' type="submit" disabled={loginLoading}>
                            {loginLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <button
                        className='button1 forgotBtn'
                        type="button"
                        onClick={() => navigate("/forgotCredentials")}
                    >
                        Forgot Credentials?
                    </button>
                </div>

                {/* ── Sign Up Panel ────────────────────────────────────────── */}
                <div className="signUp1">
                    <form onSubmit={handleSignUpSubmit}>
                        <label className='label1' htmlFor="check1" aria-hidden="true">Sign Up</label>
                        <input
                            className='input1'
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={signUpData.username}
                            onChange={handleSignUpChange}
                            required
                        />
                        <input
                            className='input1'
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={signUpData.email}
                            onChange={handleSignUpChange}
                            required
                        />
                        <input
                            className='input1'
                            type="password"
                            name="password"
                            placeholder="Password (min 6 chars)"
                            value={signUpData.password}
                            onChange={handleSignUpChange}
                            required
                        />
                        <input
                            className='input1'
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setSignUpError(""); }}
                            required
                        />
                        {signUpError && <p className="errorMsg">{signUpError}</p>}
                        <button className='button1' type="submit" disabled={signUpLoading}>
                            {signUpLoading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;