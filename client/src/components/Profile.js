import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import './Profile.css';

function Profile() {
    const { updateProfile, getProfile, getCryptoPrices } = useAuth();

    const [profile, setProfile] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState({ BTC: 0, ETH: 0 });
    const [holdings, setHoldings] = useState({ btc: 0, eth: 0 });
    const [tradeHistory, setTradeHistory] = useState([]);
    const [profileLoading, setProfileLoading] = useState(true);

    // Fetch all data from MongoDB on mount
    useEffect(() => {
        const fetchData = async () => {
            setProfileLoading(true);

            // Fetch profile from MongoDB via server
            const profileRes = await getProfile();
            if (profileRes.success) {
                setProfile({
                    username: profileRes.data.username,
                    email: profileRes.data.email,
                    password: "",
                });
                setHoldings({
                    btc: profileRes.data.btc || 0,
                    eth: profileRes.data.eth || 0,
                });
                setTradeHistory(profileRes.data.tradeHistory || []);
            }

            // Fetch live crypto prices from CoinGecko via server
            const priceRes = await getCryptoPrices();
            if (priceRes.success) {
                setPrices({
                    BTC: priceRes.data.BTC?.current_price || 0,
                    ETH: priceRes.data.ETH?.current_price || 0,
                });
            }

            setProfileLoading(false);
        };

        fetchData();
    }, [getProfile, getCryptoPrices]);

    const setProfileData = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        setMessage({ text: "", type: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateProfile(profile);
        setLoading(false);
        if (result.success) {
            setMessage({ text: "Profile updated successfully!", type: "success" });
        } else {
            setMessage({ text: result.message, type: "error" });
        }
    };

    // Stats Calculations using live prices from server
    const btcWorth = holdings.btc * prices.BTC;
    const ethWorth = holdings.eth * prices.ETH;
    const totalWorth = btcWorth + ethWorth;

    const ethPercent = totalWorth > 0 ? Math.round((ethWorth / totalWorth) * 100) : 0;
    const btcPercent = totalWorth > 0 ? Math.round((btcWorth / totalWorth) * 100) : 0;

    if (profileLoading) {
        return (
            <div className='body6'>
                <section className="container">
                    <p style={{ color: '#fff', textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>
                        Loading profile from database...
                    </p>
                </section>
            </div>
        );
    }

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

                        <label htmlFor="password" className="crLabel">New Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Leave blank to keep current"
                            value={profile.password}
                            onChange={setProfileData}
                        />

                        {message.text && (
                            <p className={message.type === "success" ? "successMsg" : "errorMsg"}>
                                {message.text}
                            </p>
                        )}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </form>
                    <br /><br />
                    <p>(Note: The details will be updated once you click the Update button.)</p>
                </div>

                <div className="otherDetails">
                    <label className="header" htmlFor="check" aria-hidden="true">My Assets</label>
                    <section className='assetsSection'>
                        <div className='ethSection'>
                            <label className='assetsLabel'>ETH</label>
                            <p className='assetsP'>Quantity: {holdings.eth.toFixed(4)}</p>
                            <p className='assetsP'>Worth: $ {ethWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className='assetsP' style={{ fontSize: '0.8em', opacity: 0.7 }}>Price: ${prices.ETH.toLocaleString()}</p>
                        </div>
                        <div className='btcSection'>
                            <label className='assetsLabel'>BTC</label>
                            <p className='assetsP'>Quantity: {holdings.btc.toFixed(4)}</p>
                            <p className='assetsP'>Worth: $ {btcWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className='assetsP' style={{ fontSize: '0.8em', opacity: 0.7 }}>Price: ${prices.BTC.toLocaleString()}</p>
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
                                        {tradeHistory.slice(-5).reverse().map((trade, idx) => (
                                            <tr key={trade._id || idx}>
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
