import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import './Trade.css';

// ── Luhn algorithm — industry standard for card number validation ────────────
function luhnCheck(num) {
    const digits = num.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10);
        if (alternate) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        alternate = !alternate;
    }
    return sum % 10 === 0;
}

// ── Detect card type from number prefix ──────────────────────────────────────
function detectCardType(num) {
    const cleaned = num.replace(/\D/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'Diners Club';
    if (/^35/.test(cleaned)) return 'JCB';
    if (/^62/.test(cleaned)) return 'UnionPay';
    return null;
}

// ── Format card number with spaces every 4 digits (Amex: 4-6-5) ─────────────
function formatCardNumber(value) {
    const cleaned = value.replace(/\D/g, '');
    const type = detectCardType(cleaned);
    if (type === 'Amex') {
        // Amex: XXXX XXXXXX XXXXX
        const part1 = cleaned.substring(0, 4);
        const part2 = cleaned.substring(4, 10);
        const part3 = cleaned.substring(10, 15);
        return [part1, part2, part3].filter(Boolean).join(' ');
    }
    // Standard: XXXX XXXX XXXX XXXX
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
}

// ── Card number expected length by type ──────────────────────────────────────
function getExpectedLength(type) {
    switch (type) {
        case 'Amex': return 15;
        case 'Diners Club': return 14;
        default: return 16;
    }
}

// ── CVC expected length ──────────────────────────────────────────────────────
function getExpectedCvcLength(type) {
    return type === 'Amex' ? 4 : 3;
}

function Trade() {
    const { executeTrade, getCryptoPrices } = useAuth();
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

    const [cardErrors, setCardErrors] = useState({
        cardNumber: "",
        cvc: "",
        expiryDate: "",
    });

    const [cardType, setCardType] = useState(null);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState({ BTC: 0, ETH: 0 });
    const [pricesLoading, setPricesLoading] = useState(true);

    // Fetch live prices on mount
    useEffect(() => {
        const fetchPrices = async () => {
            setPricesLoading(true);
            const res = await getCryptoPrices();
            if (res.success) {
                setPrices({
                    BTC: res.data.BTC?.current_price || 0,
                    ETH: res.data.ETH?.current_price || 0,
                });
            }
            setPricesLoading(false);
        };
        fetchPrices();

        // Refresh prices every 60 seconds
        const interval = setInterval(fetchPrices, 60_000);
        return () => clearInterval(interval);
    }, [getCryptoPrices]);

    const setCurrencyData = (e) => {
        setCurrency({ ...data, [e.target.name]: e.target.value });
        setMessage({ text: "", type: "" });
    };

    // ── Card Number handler: auto-format + real-time validation ──────────────
    const handleCardNumberChange = useCallback((e) => {
        const raw = e.target.value;
        const digits = raw.replace(/\D/g, '');
        // Limit to 19 digits max
        if (digits.length > 19) return;

        const formatted = formatCardNumber(digits);
        const type = detectCardType(digits);
        setCardType(type);
        setCreditCard(prev => ({ ...prev, cardNumber: formatted }));

        // Validate
        const expectedLen = type ? getExpectedLength(type) : 16;
        if (digits.length === 0) {
            setCardErrors(prev => ({ ...prev, cardNumber: "" }));
        } else if (digits.length < expectedLen) {
            setCardErrors(prev => ({ ...prev, cardNumber: `${type || 'Card'} requires ${expectedLen} digits` }));
        } else if (!luhnCheck(digits)) {
            setCardErrors(prev => ({ ...prev, cardNumber: "Invalid card number" }));
        } else {
            setCardErrors(prev => ({ ...prev, cardNumber: "" }));
        }
        setMessage({ text: "", type: "" });
    }, []);

    // ── CVC handler: digits only, validate length ────────────────────────────
    const handleCvcChange = useCallback((e) => {
        const value = e.target.value.replace(/\D/g, '');
        const expectedLen = getExpectedCvcLength(cardType);
        if (value.length > 4) return;

        setCreditCard(prev => ({ ...prev, cvc: value }));

        if (value.length === 0) {
            setCardErrors(prev => ({ ...prev, cvc: "" }));
        } else if (value.length < expectedLen) {
            setCardErrors(prev => ({ ...prev, cvc: `CVC must be ${expectedLen} digits${cardType ? ` for ${cardType}` : ''}` }));
        } else if (value.length > expectedLen) {
            setCardErrors(prev => ({ ...prev, cvc: `CVC must be ${expectedLen} digits${cardType ? ` for ${cardType}` : ''}` }));
        } else {
            setCardErrors(prev => ({ ...prev, cvc: "" }));
        }
        setMessage({ text: "", type: "" });
    }, [cardType]);

    // ── Expiry Date handler: must be in the future ───────────────────────────
    const handleExpiryChange = useCallback((e) => {
        const value = e.target.value; // format: "YYYY-MM"
        setCreditCard(prev => ({ ...prev, expiryDate: value }));

        if (!value) {
            setCardErrors(prev => ({ ...prev, expiryDate: "" }));
            return;
        }

        const [year, month] = value.split('-').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            setCardErrors(prev => ({ ...prev, expiryDate: "Card has expired" }));
        } else if (year > currentYear + 20) {
            setCardErrors(prev => ({ ...prev, expiryDate: "Invalid expiry date" }));
        } else {
            setCardErrors(prev => ({ ...prev, expiryDate: "" }));
        }
        setMessage({ text: "", type: "" });
    }, []);

    const returnCost = () => {
        const qty = parseFloat(data.quantity) || 0;
        const price = prices[data.currency] || 0;
        return qty * price;
    };

    // ── Full validation before submit ────────────────────────────────────────
    const validateAll = () => {
        const errors = {};
        const digits = creditCard.cardNumber.replace(/\D/g, '');
        const expectedLen = cardType ? getExpectedLength(cardType) : 16;
        const expectedCvcLen = getExpectedCvcLength(cardType);

        // Quantity
        const qty = parseFloat(data.quantity);
        if (!qty || qty <= 0) {
            setMessage({ text: "Please enter a valid quantity.", type: "errorMsg" });
            return false;
        }

        // Card number
        if (digits.length === 0) {
            errors.cardNumber = "Card number is required";
        } else if (digits.length < expectedLen) {
            errors.cardNumber = `${cardType || 'Card'} requires ${expectedLen} digits`;
        } else if (!luhnCheck(digits)) {
            errors.cardNumber = "Invalid card number (failed checksum)";
        }

        // CVC
        if (!creditCard.cvc) {
            errors.cvc = "CVC is required";
        } else if (!/^\d+$/.test(creditCard.cvc)) {
            errors.cvc = "CVC must contain only digits";
        } else if (creditCard.cvc.length !== expectedCvcLen) {
            errors.cvc = `CVC must be ${expectedCvcLen} digits${cardType ? ` for ${cardType}` : ''}`;
        }

        // Expiry
        if (!creditCard.expiryDate) {
            errors.expiryDate = "Expiry date is required";
        } else {
            const [year, month] = creditCard.expiryDate.split('-').map(Number);
            const now = new Date();
            if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
                errors.expiryDate = "Card has expired";
            }
        }

        if (Object.keys(errors).length > 0) {
            setCardErrors(prev => ({ ...prev, ...errors }));
            setMessage({ text: "Please fix the card errors highlighted above.", type: "errorMsg" });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAll()) return;

        setLoading(true);

        const cleanedCard = creditCard.cardNumber.replace(/\D/g, '');

        const result = await executeTrade({
            currency: data.currency,
            quantity: data.quantity,
            cardNumber: cleanedCard,
            cvc: creditCard.cvc,
            expiryDate: creditCard.expiryDate,
        });

        if (result.success) {
            setMessage({ text: "Payment Successful! Redirecting...", type: "successMsg" });
            setTimeout(() => {
                navigate("/profile");
            }, 1500);
        } else {
            setMessage({ text: result.message || "Payment Failed!", type: "errorMsg" });
        }

        setLoading(false);
    };

    return (
        <div className="body7">
            <div className="selectCurrency">
                <form className="form1">
                    <label className="header1" htmlFor="check" aria-hidden="true">Select Currency</label>
                    {pricesLoading ? (
                        <p style={{ color: '#aaa', textAlign: 'center' }}>Loading live prices...</p>
                    ) : (
                        <p style={{ color: '#7fdbca', textAlign: 'center', fontSize: '0.9em', marginBottom: '10px' }}>
                            BTC: ${prices.BTC.toLocaleString()} | ETH: ${prices.ETH.toLocaleString()}
                        </p>
                    )}
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

                    <label htmlFor="cardNumber" className="crLabel">
                        Card Number
                        {cardType && <span className="cardTypeBadge">{cardType}</span>}
                    </label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={creditCard.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={cardType === 'Amex' ? 17 : 19}
                        autoComplete="cc-number"
                        inputMode="numeric"
                        className={cardErrors.cardNumber ? 'inputError' : creditCard.cardNumber && !cardErrors.cardNumber ? 'inputValid' : ''}
                        required
                    />
                    {cardErrors.cardNumber && <p className="fieldError">{cardErrors.cardNumber}</p>}

                    <br /><label htmlFor="cvc" className="crLabel">CVC</label>
                    <input
                        type="password"
                        id="cvc"
                        name="cvc"
                        placeholder={cardType === 'Amex' ? 'XXXX' : 'XXX'}
                        value={creditCard.cvc}
                        onChange={handleCvcChange}
                        maxLength={cardType === 'Amex' ? 4 : 3}
                        autoComplete="cc-csc"
                        inputMode="numeric"
                        className={cardErrors.cvc ? 'inputError' : creditCard.cvc && !cardErrors.cvc ? 'inputValid' : ''}
                        required
                    />
                    {cardErrors.cvc && <p className="fieldError">{cardErrors.cvc}</p>}

                    <br /><label htmlFor="expiryDate" className="crLabel">Expiry Date</label>
                    <input
                        type="month"
                        id="expiryDate"
                        name="expiryDate"
                        value={creditCard.expiryDate}
                        onChange={handleExpiryChange}
                        autoComplete="cc-exp"
                        className={cardErrors.expiryDate ? 'inputError' : creditCard.expiryDate && !cardErrors.expiryDate ? 'inputValid' : ''}
                        required
                    />
                    {cardErrors.expiryDate && <p className="fieldError">{cardErrors.expiryDate}</p>}

                    {message.text && (
                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <p className={message.type === "successMsg" ? "successMsg" : "errorMsg"} style={{ fontSize: "1em" }}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <button type="submit" disabled={loading || cardErrors.cardNumber || cardErrors.cvc || cardErrors.expiryDate}>
                        {loading ? 'Processing...' : 'Submit Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Trade;
