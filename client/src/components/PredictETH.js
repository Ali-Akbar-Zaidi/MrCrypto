import React, { useState } from 'react';
import './PredictETH.css';

function PredictETH() {
    const [date, setDate] = useState('');

    const handleDateChange = (event) => {
        setDate(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Here you can handle form submission, such as fetching data for the selected date
        console.log("Selected Date:", date);
    };

    return (
        <div className='body4'>
            <div className="main">
                <form onSubmit={handleSubmit}>
                    <label className="heading" htmlFor="check" aria-hidden="true">Predict Ethereum Prices on Specific Dates</label>
                    <input
                        className="date"
                        type="date"
                        name="date"
                        value={date}
                        onChange={handleDateChange}
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

export default PredictETH;
