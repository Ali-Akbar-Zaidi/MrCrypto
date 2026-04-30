const express = require("express");
const router = express.Router();
const cryptoControllers = require("../controllers/crypto-controller");

// Public routes — no auth needed for viewing prices
router.route("/prices").get(cryptoControllers.getPrices);
router.route("/history/:coinId").get(cryptoControllers.getHistory);
router.route("/predict").post(cryptoControllers.predict);

module.exports = router;
