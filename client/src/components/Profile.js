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
    
    // Stats Calculations
    const btcWorth = btcQty * BTC_PRICE;
    const ethWorth = ethQty * ETH_PRICE;
    const totalWorth = btcWorth + ethWorth;
    
    const ethPercent = totalWorth > 0 ? Math.round((ethWorth / totalWorth) * 100) : 0;
    const btcPercent = totalWorth > 0 ? Math.round((btcWorth / totalWorth) * 100) : 0;

    const userId = localStorage.getItem('userId');
    const historyStr = localStorage.getItem(`tradeHistory_${userId}`);
    const tradeHistory = historyStr ? JSON.parse(historyStr) : [];

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
                        <div className='ethSection'>
                            <label className='assetsLabel'>ETH</label>
                            <p className='assetsP'>Quantity: {ethQty.toFixed(4)}</p>
                            <p className='assetsP'>Worth: $ {(ethQty * ETH_PRICE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className='btcSection'>
                            <label className='assetsLabel'>BTC</label>
                            <p className='assetsP'>Quantity: {btcQty.toFixed(4)}</p>
                            <p className='assetsP'>Worth: $ {(btcQty * BTC_PRICE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </section>

                    {/* --- STATS DASHBOARD --- */}
                    <label className="header" htmlFor="check" aria-hidden="true" style={{ marginTop: '20px' }}>My Stats</label>
                    <section className='statsSection'>
                        <div className="portfolioTotal">
                            <p>Total Portfolio Value</p>
                            <h2>$ {totalWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                            
                            {/* Allocation Bar */}
                            {totalWorth > 0 && (
                                <div className="allocationBar">
                                    <div className="ethBar" style={{ width: `${ethPercent}%` }} title={`ETH: ${ethPercent}%`}>
                                        {ethPercent > 10 ? 'ETH' : ''}
                                    </div>
                                    <div className="btcBar" style={{ width: `${btcPercent}%` }} title={`BTC: ${btcPercent}%`}>
                                        {btcPercent > 10 ? 'BTC' : ''}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="tradeHistory">
                            <p className="historyTitle">Recent Trades</p>
                            {tradeHistory.length > 0 ? (
                                <table className="historyTable">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Asset</th>
                                            <th>Qty</th>
                                            <th>Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tradeHistory.slice(-5).reverse().map(trade => (
                                            <tr key={trade.id}>
                                                <td>{new Date(trade.date).toLocaleDateString()}</td>
                                                <td className={trade.currency === 'ETH' ? 'ethText' : 'btcText'}>{trade.currency}</td>
                                                <td>{trade.quantity}</td>
                                                <td>${Number(trade.cost).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="noTrades">No trades yet. Head to Trade With Us to get started!</p>
                            )}
                        </div>
                    </section>

                </div>
            </section>
        </div>
    );
}

export default Profile;
