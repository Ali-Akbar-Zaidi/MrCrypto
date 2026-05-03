import React, { useState } from 'react';
import { useAuth } from '../store/auth';
import './PredictETH.css';
import { usePageTitle } from './usePageTitle';

function PredictETH() {
    usePageTitle('Predict ETH');
    const { predictPrice } = useAuth();
    const [date, setDate] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [basePrice, setBasePrice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDateChange = (event) => {
        setDate(event.target.value);
        setPrediction(null);
        setBasePrice(null);
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!date) return;
        
        setLoading(true);
        setPrediction(null);
        setError('');

        const result = await predictPrice({ coin: "ETH", date });

        if (result.success) {
            setPrediction(result.data.prediction);
            setBasePrice(result.data.basePrice);
        } else {
            setError(result.message || "Failed to get prediction");
        }

        setLoading(false);
    };

    return (
        <div className='body4'>
            <div className="main">
                <form onSubmit={handleSubmit}>
                    <label className="heading" htmlFor="check" aria-hidden="true">Predict Ethereum Prices</label>
                    {basePrice && (
                        <p style={{ color: '#627eea', textAlign: 'center', fontSize: '0.9em', margin: '5px 0' }}>
                            Current ETH Price: $ {Number(basePrice).toLocaleString()}
                        </p>
                    )}
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

                {error && (
                    <p style={{ color: '#e74c3c', textAlign: 'center', marginTop: '10px' }}>{error}</p>
                )}
                
                <section className="predictionDetails">
                    <div className="pdLabel">Open Price: {prediction ? `$ ${Number(prediction.open).toLocaleString()}` : '-----'}</div>
                    <div className="pdLabel">High Price: {prediction ? `$ ${Number(prediction.high).toLocaleString()}` : '-----'}</div>
                    <div className="pdLabel">Low Price:  {prediction ? `$ ${Number(prediction.low).toLocaleString()}` : '-----'}</div>
                    <div className="pdLabel currentPriceLabel">Current Price: {prediction ? `$ ${Number(prediction.current).toLocaleString()}` : '-----'}</div>
                </section>
            </div>
        </div>
    );
}

export default PredictETH;
