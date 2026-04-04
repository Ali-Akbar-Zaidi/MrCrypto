import React, { useState } from 'react';
import './Trade.css';

function Trade() {
    const [data, setCurrency] = useState({
        userId: localStorage.getItem("userId"),
        currency: "ETH",
        quantity: "0",
    });

    const setCurrencyData = (e) => {
        console.log(e);
        let name = e.target.name;
        let value = e.target.value;

        setCurrency({
            ...data,
            [name]: value,
        })
    }

    const returnCost = () => {
        if (data.currency === 'ETH') {
            return data.quantity * 2905.31;
        }
        return data.quantity * 61731.50;
    }

    const [creditCard, setCreditCard] = useState({
        cardNumber: "",
        cvc: "",
        expiryDate: "",
    });

    const setCreditCardData = (e) => {
        console.log(e);
        let name = e.target.name;
        let value = e.target.value;

        setCreditCard({
            ...creditCard,
            [name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(data);
        try {
            const response = await fetch(`http://localhost:5000/api/auth/trade`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.status === 200) {
                alert('Payment Successful!');
                const res_data = await response.json();
                localStorage.setItem('btc', parseFloat(res_data.btc));
                localStorage.setItem('eth', parseFloat(res_data.eth));
                window.location.href = "/";
            } else if (response.status === 404) {
                alert("User Not Found!");
            } else {
                alert('Payment Failed!');
            }
        } catch (error) {
            console.log("payment", error);
        }
    }

    return (
        <div className="body7">
            <div className="selectCurrency">
                <form className="form1">
                    <label className="header1" htmlFor="check" aria-hidden="true">Select Currency</label>
                    <select name="currency" value={data.option} onChange={setCurrencyData}>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="BTC">BTC (BitCoin)</option>
                    </select>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Enter Quantity"
                        value={data.option}
                        onChange={setCurrencyData}
                        required
                    />
                    <p className="total" htmlFor="check" aria-hidden="true">Total Price: $ {returnCost()}</p>
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
                        required
                    />

                    <br /><label htmlFor="expiryDate" className="crLabel">Expiry Date</label>
                    <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        placeholder=""
                        value={creditCard.expiryDate}
                        onChange={setCreditCardData}
                        required
                    />

                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Trade;
