const User = require("../models/user-schema");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../key");
const nodemailer = require("nodemailer");

/**
 * POST /api/auth/signUp
 * Body validated by Zod middleware (signUpSchema)
 */
const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const usernameExist = await User.findOne({ username });
        if (usernameExist) {
            return res.status(409).json({ message: "Username already registered!" });
        }

        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(409).json({ message: "Email already registered!" });
        }

        const userCreated = await User.create({ username, email, password });
        const token = jwt.sign({ _id: userCreated._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "SignUp successful",
            token,
            userId: userCreated._id.toString(),
            user: userCreated.username,
            email: userCreated.email,
        });
    } catch (error) {
        console.error("signUp error:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
};

/**
 * POST /api/auth/login
 * Body validated by Zod middleware (loginSchema)
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const userExist = await User.findOne({ username });
        if (!userExist) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        if (password !== userExist.password) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign({ _id: userExist._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            message: "Login successful",
            token,
            userId: userExist._id.toString(),
            user: userExist.username,
            email: userExist.email,
            btc: userExist.btc,
            eth: userExist.eth,
        });
    } catch (error) {
        console.error("login error:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
};

/**
 * PUT /api/auth/updateProfile
 * Protected by authMiddleware — req.userId is available
 * Body validated by Zod middleware (updateProfileSchema)
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { username, email, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check for duplicate username (skip current user)
        if (username && username !== user.username) {
            const existing = await User.findOne({ username });
            if (existing) {
                return res.status(409).json({ message: "Username already taken!" });
            }
            user.username = username;
        }

        // Check for duplicate email (skip current user)
        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(409).json({ message: "Email already taken!" });
            }
            user.email = email;
        }

        if (password) user.password = password;

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            username: updatedUser.username,
            email: updatedUser.email,
        });
    } catch (error) {
        console.error("updateProfile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * PUT /api/auth/trade
 * Protected by authMiddleware — req.userId is available
 * Body validated by Zod middleware (tradeSchema)
 */
const trade = async (req, res) => {
    try {
        const userId = req.userId;
        const { currency, quantity, cardNumber, cvc, expiryDate } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch real-time price from CoinGecko
        const coinId = currency === "BTC" ? "bitcoin" : "ethereum";
        let pricePerUnit = 0;
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&per_page=1&page=1&sparkline=false`
            );
            const coins = await response.json();
            if (coins.length > 0) {
                pricePerUnit = coins[0].current_price;
            } else {
                throw new Error("No price data");
            }
        } catch (err) {
            console.error("Failed to fetch live price for trade:", err.message);
            // Fallback prices
            pricePerUnit = currency === "BTC" ? 76000 : 2250;
        }

        const cost = quantity * pricePerUnit;

        if (currency === "BTC") {
            user.btc += quantity;
        } else {
            user.eth += quantity;
        }

        // Add to trade history
        user.tradeHistory.push({
            currency,
            quantity,
            priceAtTrade: pricePerUnit,
            cost,
            type: "BUY",
            date: new Date(),
        });

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Trade executed successfully!",
            btc: updatedUser.btc,
            eth: updatedUser.eth,
            trade: {
                currency,
                quantity,
                priceAtTrade: pricePerUnit,
                cost,
                type: "BUY",
                date: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("trade error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/auth/profile
 * Protected by authMiddleware — req.userId is available
 * Returns user data and trade history
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
            btc: user.btc,
            eth: user.eth,
            tradeHistory: user.tradeHistory,
        });
    } catch (error) {
        console.error("getProfile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Helper: send email
 */
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "abubakarshahid1309@gmail.com",
            pass: "kaggvgypeicwmrsi",
        },
    });

    const mailOptions = {
        from: "abubakarshahid1309@gmail.com",
        to,
        subject,
        text,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) reject(error);
            else resolve(info.response);
        });
    });
};

/**
 * POST /api/auth/forgotCredentials
 * Body validated by Zod middleware (forgotCredentialsSchema)
 */
const forgotCredentials = async (req, res) => {
    try {
        const { username, email } = req.body;

        const user = await User.findOne({ username, email });
        if (!user) {
            return res.status(404).json({ message: "No account found with those credentials!" });
        }

        try {
            const subject = "Password Recovery — Mr.Crypto";
            const text = `Dear ${username},\n\nHere is the password for your Mr.Crypto Account: ${user.password}\n\nThanks and Regards,\nTeam Mr.Crypto`;
            await sendEmail(email, subject, text);
            return res.status(200).json({ message: "Password sent to your email!" });
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
            // Still return password inline as fallback for demo
            return res.status(200).json({
                message: "Email sending failed but here is your password.",
                password: user.password,
            });
        }
    } catch (error) {
        console.error("forgotCredentials error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { signUp, login, updateProfile, trade, getProfile, forgotCredentials };