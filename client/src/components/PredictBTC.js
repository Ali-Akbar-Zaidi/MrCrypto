import React from 'react';
import './PredictBTC.css';

function PredictBTC() {
    return (
        <div className='body5'>
        <p>(BTC Prediction Currently Not Available!)</p>
            <div className="main">
                <form>
                    <label className="heading" htmlFor="check" aria-hidden="true">Predict BitCoin Prices on Specific Dates</label>
                    <input
                        className="date"
                        type="date"
                        name="date"
                        // value={date}
                        // onChange={handleDateChange}
                        required
                    />
                    <button type="submit">Predict</button>
                </form>
                <section className="predictionDetails">
                    <div className="pdLabel">Open Price: -----</div>
                    <div className="pdLabel">High Price: -----</div>
                    <div className="pdLabel">Low Price: -----</div>
                    <div className="pdLabel">Current Price: -----</div>
                </section>
            </div>
        </div>
    );
}

export default PredictBTC;
