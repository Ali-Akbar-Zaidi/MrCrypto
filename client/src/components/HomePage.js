import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import "./HomePage.css";
import Logo from "./Images/Logo.JPG";
import Img1 from "./Images/cryptocurrency-1.png";
import Img2 from "./Images/Bitcoin-price-2.png";
import Img3 from "./Images/37387-3.png";

import { usePageTitle } from './usePageTitle';

function Home() {
    usePageTitle('Home');
    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(document.body.classList.contains('dark-mode'));
    }, []);

    const toggleDarkMode = (e) => {
        e.preventDefault();
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        localStorage.setItem('darkMode', nextMode);
        if (nextMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    function handleLoginSignUpClick() {
        if (localStorage.getItem('token')) {
            alert("You are already Logged In!");
        } else {
            navigate("login");
        }
    }

    function handleProfileClick() {
        if (!localStorage.getItem('token')) {
            alert("Login with an existing account or create a new account to view your profile!");
        } else {
            navigate("profile");
        }
    }

    function handleTradeClick() {
        if (!localStorage.getItem('token')) {
            alert("Login with an existing account or create a new account to view your profile!");
        } else {
            navigate("trade");
        }
    }

    return (
        <div className='body2'>
            <section className="container2">
                <div className="header2"><img src={Logo} alt="logo" /></div>
                <div className="main2">
                    <header>Welcome to Mr.Crypto <b>{user}</b>!!!</header>
                    <div className='menuItems2'>
                        <a id="mc" className='item' href=""
                            onClick={handleLoginSignUpClick}>Login/SignUp</a>
                        <a id="mc" className='item' href=""
                            onClick={handleProfileClick}>Profile</a>
                        <a id="mc" className='item' href="predictETH">Predict ETH</a>
                        <a id="mc" className='item' href="predictBTC">Predict BTC</a>
                        <a id="mc" className='item' href=""
                            onClick={handleTradeClick}>Trade With Us</a>
                        <a id="mc" className='item' href="/" onClick={(e) => {
                            e.preventDefault();
                            if (isLoggedIn) {
                                logout();
                                alert("You are now Logged Out!");
                                navigate("/");
                            } else {
                                alert("Already Logged Out!");
                            }
                        }}
                        >Log Out</a>
                        <a id="mc" className='item' href="" onClick={toggleDarkMode}>
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </a>
                    </div>
                </div>
                <div className="box1">
                    <p><span className="span">What is cryptocurrency price prediction?</span><br />
                        Cryptocurrency price prediction is the process of forecasting the future value of a cryptocurrency. It involves analyzing various factors such as historical price data, market trends, news events, and technological advancements to determine the potential price trajectory of a particular cryptocurrency.
                        Whether it’s Bitcoin, Ethereum, or Solana, predicting cryptocurrency prices with absolute certainty is challenging due to the inherent volatility, and the dynamic nature of the crypto market. However, various methods and approaches can be employed to make informed price projections.
                    </p>
                    <img className="img1" src={Img1} alt="img1" />
                </div>
                <div className="box2">
                    <img className="img2" src={Img2} alt="img2" />
                    <p><span className="span">What affects cryptocurrency prices?</span><br />
                        The cryptocurrency market is a complex and ever-evolving landscape, influenced by a multitude of factors. These include supply and demand, network usage and adoption, government regulations, media coverage, technological advancements, market sentiment, major news events, and the actions of whales or market manipulators. Understanding these factors and their interconnectedness is essential for making informed investment decisions in the crypto space.
                    </p>
                </div>
                <div className="box3">
                    <p><span className="span">How to predict crypto prices?</span><br />
                        Technical indicators are the most common way of predicting crypto price movements. One of the most used technical indicators are moving averages. Insights are drawn from whether the price is above or below important moving averages like the 21-day, 50-day, and 200-day averages. Additionally, oscillators like the Relative Strength Index (RSI) and Moving Average Convergence Divergence (MACD) are used to analyze short-term market trends and pinpoint potential trading options.
                    </p>
                    <img className="img3" src={Img3} alt="img3" />
                </div>
            </section>
            <footer className="footer2">
                <p>Mr.Crypto Prediction App &copy; 2026, All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default Home;