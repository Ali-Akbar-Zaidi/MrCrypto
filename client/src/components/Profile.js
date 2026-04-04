import React, { useState } from 'react';
import { useAuth } from '../store/auth';
import './Profile.css';

function Profile() {
    const { updateProfile } = useAuth();

    const [profile, setProfile] = useState({
        userId: localStorage.getItem("userId") || "",
        username: localStorage.getItem("user") || "",
        email: localStorage.getItem("email") || "",
        password: localStorage.getItem("password") || "",
    });

    const [message, setMessage] = useState({ text: "", type: "" });

    const setProfileData = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        setMessage({ text: "", type: "" });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = updateProfile(profile);
        if (result.success) {
            setMessage({ text: "Profile updated successfully!", type: "success" });
        } else {
            setMessage({ text: result.message, type: "error" });
        }
    };

    const BTC_PRICE = 61731.50;
    const ETH_PRICE = 2905.31;

    const btcQty = parseFloat(localStorage.getItem('btc') || "0");
    const ethQty = parseFloat(localStorage.getItem('eth') || "0");

    return (
        <div className='body6'>
            <section className="container">
                <div className="credentials">
                    <form onSubmit={handleSubmit}>
                        <label className="header" htmlFor="check" aria-hidden="true">My Profile</label>

                        <label htmlFor="username" className="crLabel">Username</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={profile.username}
                            onChange={setProfileData}
                            required
                        />

                        <label htmlFor="email" className="crLabel">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={profile.email}
                            onChange={setProfileData}
                            required
                        />

                        <label htmlFor="password" className="crLabel">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={profile.password}
                            onChange={setProfileData}
                            required
                        />

                        {message.text && (
                            <p className={message.type === "success" ? "successMsg" : "errorMsg"}>
                                {message.text}
                            </p>
                        )}

                        <button type="submit">Update</button>
                    </form>
                    <br /><br />
                    <p>(Note: The details will be updated once you click the Update button.)</p>
                </div>

                <div className="otherDetails">
                    <label className="header" htmlFor="check" aria-hidden="true">My Assets</label>
                    <section className='assetsSection'>
                        <div className='btcSection'>
                            <label className='assetsLabel'>BTC</label>
                            <p className='assetsP'>Quantity: {btcQty}</p>
                            <p className='assetsP'>Worth: $ {(btcQty * BTC_PRICE).toFixed(2)}</p>
                        </div>
                        <div className='ethSection'>
                            <label className='assetsLabel'>ETH</label>
                            <p className='assetsP'>Quantity: {ethQty}</p>
                            <p className='assetsP'>Worth: $ {(ethQty * ETH_PRICE).toFixed(2)}</p>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}

export default Profile;
