const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
    currency: { type: String, enum: ["BTC", "ETH"], required: true },
    quantity: { type: Number, required: true },
    priceAtTrade: { type: Number, required: true },
    cost: { type: Number, required: true },
    type: { type: String, enum: ["BUY", "SELL"], default: "BUY" },
    date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    btc: { type: Number, default: 0 },
    eth: { type: Number, default: 0 },
    tradeHistory: { type: [tradeSchema], default: [] },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
