import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import './Trade.css';

function Trade() {
    const { updateHoldings } = useAuth();
    const navigate = useNavigate();

    const [data, setCurrency] = useState({
        currency: "ETH",
        quantity: "",
    });

    const [creditCard, setCreditCard] = useState({
        cardNumber: "",
        cvc: "",
        expiryDate: "",
    });

    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    const setCurrencyData = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        setCurrency({ ...data, [name]: value });
        setMessage({ text: "", type: "" });
    };

    const setCreditCardData = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        setCreditCard({ ...creditCard, [name]: value });
        setMessage({ text: "", type: "" });
    };

    const returnCost = () => {
        const qty = parseFloat(data.quantity) || 0;
        if (data.currency === 'ETH') return qty * 2905.31;
        if (data.currency === 'BTC') return qty * 61731.50;
        return 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const qty = parseFloat(data.quantity);
        if (!qty || qty <= 0) {
            setMessage({ text: "Please enter a valid quantity.", type: "errorMsg" });
            return;
        }

        if (creditCard.cardNumber.length < 16) {
            setMessage({ text: "Invalid card number.", type: "errorMsg" });
            return;
        }

        setLoading(true);

        setTimeout(() => {
            try {
                // Update specific balances
                const currentBtc = parseFloat(localStorage.getItem('btc') || "0");
                const currentEth = parseFloat(localStorage.getItem('eth') || "0");

                let newBtc = currentBtc;
                let newEth = currentEth;

                if (data.currency === 'ETH') {
                    newEth += qty;
                } else if (data.currency === 'BTC') {
                    newBtc += qty;
                }

                updateHoldings({ btc: newBtc.toString(), eth: newEth.toString() });

                // Record transaction in history
                const userId = localStorage.getItem('userId');
                const historyStr = localStorage.getItem(`tradeHistory_${userId}`);
                const history = historyStr ? JSON.parse(historyStr) : [];
                
                history.push({
                    id: Date.now(),
                    date: new Date().toISOString(),
                    currency: data.currency,
                    quantity: qty,
                    cost: returnCost(),
                    type: "BUY"
                });
                
                localStorage.setItem(`tradeHistory_${userId}`, JSON.stringify(history));

                setMessage({ text: "Payment Successful! Redirecting...", type: "successMsg" });
                
                setTimeout(() => {
                    navigate("/profile");
                }, 1500);

            } catch (error) {
                console.log("payment", error);
                setMessage({ text: "Payment Failed!", type: "errorMsg" });
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="body7">
            <div className="selectCurrency">
                <form className="form1">
                    <label className="header1" htmlFor="check" aria-hidden="true">Select Currency</label>
                    <select name="currency" value={data.currency} onChange={setCurrencyData}>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="BTC">BTC (Bitcoin)</option>
                    </select>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Enter Quantity"
                        value={data.quantity}
                        onChange={setCurrencyData}
                        step="0.001"
                        min="0.001"
                        required
                    />
                    <p className="total" htmlFor="check" aria-hidden="true">
                        Total Price: $ {returnCost().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </form>
            </div>
            
            <div className="enterDetails">
                <form className="form2" onSubmit={handleSubmit}>
                    <label className="header2" htmlFor="check" aria-hidden="true">Credit Card Details</label>

                    <label htmlFor="cardNumber" className="crLabel">Card Number</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={creditCard.cardNumber}
                        onChange={setCreditCardData}
                        maxLength="19"
                        required
                    />

                    <br /><label htmlFor="cvc" className="crLabel">CVC</label>
                    <input
                        type="text"
                        id="cvc"
                        name="cvc"
                        placeholder="XXX"
                        value={creditCard.cvc}
                        onChange={setCreditCardData}
                        maxLength="4"
                        required
                    />

                    <br /><label htmlFor="expiryDate" className="crLabel">Expiry Date</label>
                    <input
                        type="month"
                        id="expiryDate"
                        name="expiryDate"
                        value={creditCard.expiryDate}
                        onChange={setCreditCardData}
                        required
                    />

                    {message.text && (
                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <p className={message.type === "successMsg" ? "successMsg" : "errorMsg"} style={{ fontSize: "1em" }}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Submit Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Trade;
