import React, { useState } from 'react';
import './PredictBTC.css';

function PredictBTC() {
    const [date, setDate] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (event) => {
        setDate(event.target.value);
        setPrediction(null);
    };

    // Simple pseudo-random hash generator based on the date string
    const generateHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!date) return;
        
        setLoading(true);
        setPrediction(null);

        // Simulate network/processing delay for realism
        setTimeout(() => {
            // Using a base price for BTC to generate realistic fluctuations
            const basePrice = 61731.50;
            const hash = generateHash(date + "BTC"); // differentiation from ETH
            
            // Map the hash to a predictable randomness factor between -0.10 and +0.30
            const factor = ((hash % 100) / 100) * 0.4 - 0.10; 
            
            const predictedCurrent = basePrice * (1 + factor);
            const predictedHigh = predictedCurrent * (1 + ((hash % 50) / 1000) + 0.015);
            const predictedLow = predictedCurrent * (1 - ((hash % 40) / 1000) - 0.015);
            const predictedOpen = predictedCurrent * (1 + (((hash % 20) - 10) / 1000));
            
            setPrediction({
                current: predictedCurrent.toFixed(2),
                high: predictedHigh.toFixed(2),
                low: predictedLow.toFixed(2),
                open: predictedOpen.toFixed(2)
            });
            
            setLoading(false);
        }, 1200);
    };

    return (
        <div className='body5'>
            <div className="main">
                <form onSubmit={handleSubmit}>
                    <label className="heading" htmlFor="check" aria-hidden="true">Predict Bitcoin Prices</label>
                    <input
                        className="date"
                        type="date"
                        name="date"
                        value={date}
                        onChange={handleDateChange}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Predicting...' : 'Predict'}
                    </button>
                </form>
                
                <section className="predictionDetails">
                    <div className="pdLabel">Open Price: {prediction ? `$ ${prediction.open}` : '-----'}</div>
                    <div className="pdLabel">High Price: {prediction ? `$ ${prediction.high}` : '-----'}</div>
                    <div className="pdLabel">Low Price:  {prediction ? `$ ${prediction.low}` : '-----'}</div>
                    <div className="pdLabel currentPriceLabel">Current Price: {prediction ? `$ ${prediction.current}` : '-----'}</div>
                </section>
            </div>
        </div>
    );
}

export default PredictBTC;
