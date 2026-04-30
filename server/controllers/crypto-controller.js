/**
 * Crypto Controller
 * Fetches real-time cryptocurrency data from the CoinGecko public API (free, no key needed).
 * Docs: https://docs.coingecko.com/reference/introduction
 */

// Cache to avoid hammering the API (CoinGecko rate-limits free tier to ~30 req/min)
let priceCache = { data: null, timestamp: 0 };
const CACHE_DURATION_MS = 30_000; // 30 seconds

/**
 * GET /api/crypto/prices
 * Returns current BTC and ETH prices with 24h change, market cap, volume, etc.
 */
const getPrices = async (req, res) => {
    try {
        const now = Date.now();
        if (priceCache.data && now - priceCache.timestamp < CACHE_DURATION_MS) {
            return res.status(200).json(priceCache.data);
        }

        const url =
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&per_page=2&page=1&sparkline=false&price_change_percentage=24h,7d";

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`CoinGecko API returned ${response.status}`);
        }

        const coins = await response.json();
        const data = {};
        for (const coin of coins) {
            const key = coin.symbol.toUpperCase(); // BTC or ETH
            data[key] = {
                id: coin.id,
                name: coin.name,
                symbol: key,
                image: coin.image,
                current_price: coin.current_price,
                market_cap: coin.market_cap,
                total_volume: coin.total_volume,
                high_24h: coin.high_24h,
                low_24h: coin.low_24h,
                price_change_24h: coin.price_change_24h,
                price_change_percentage_24h: coin.price_change_percentage_24h,
                price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
                circulating_supply: coin.circulating_supply,
                ath: coin.ath,
                atl: coin.atl,
                last_updated: coin.last_updated,
            };
        }

        priceCache = { data, timestamp: now };
        return res.status(200).json(data);
    } catch (error) {
        console.error("getPrices error:", error.message);
        // Return cached data if available (stale is better than nothing)
        if (priceCache.data) {
            return res.status(200).json(priceCache.data);
        }
        return res.status(502).json({ message: "Failed to fetch crypto prices. Try again later." });
    }
};

/**
 * GET /api/crypto/history/:coinId
 * Returns historical OHLC data for a given coin (bitcoin or ethereum).
 * Query params: days (default 30)
 * CoinGecko OHLC endpoint returns [timestamp, open, high, low, close]
 */
const getHistory = async (req, res) => {
    try {
        const { coinId } = req.params; // "bitcoin" or "ethereum"
        const days = req.query.days || "30";

        if (!["bitcoin", "ethereum"].includes(coinId)) {
            return res.status(400).json({ message: "coinId must be 'bitcoin' or 'ethereum'" });
        }

        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`CoinGecko API returned ${response.status}`);
        }

        const ohlcData = await response.json();
        // CoinGecko returns [ [timestamp, open, high, low, close], ... ]
        const formatted = ohlcData.map(([timestamp, open, high, low, close]) => ({
            timestamp,
            date: new Date(timestamp).toISOString(),
            open,
            high,
            low,
            close,
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("getHistory error:", error.message);
        return res.status(502).json({ message: "Failed to fetch historical data. Try again later." });
    }
};

/**
 * POST /api/crypto/predict
 * Body: { coin: "BTC" | "ETH", date: "YYYY-MM-DD" }
 * Uses the latest real price data + the date offset to generate a plausible prediction.
 * This prediction is NOT real financial advice — it's a model simulation for the app.
 */
const predict = async (req, res) => {
    try {
        const { coin, date } = req.body;

        if (!coin || !["BTC", "ETH"].includes(coin)) {
            return res.status(400).json({ message: "coin must be 'BTC' or 'ETH'" });
        }
        if (!date) {
            return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
        }

        // Use the price cache or fetch via the markets endpoint (which we know works)
        let basePrice;
        const now = Date.now();
        if (priceCache.data && now - priceCache.timestamp < CACHE_DURATION_MS && priceCache.data[coin]) {
            basePrice = priceCache.data[coin].current_price;
        } else {
            // Fetch from the markets endpoint (same as getPrices)
            const coinId = coin === "BTC" ? "bitcoin" : "ethereum";
            const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&per_page=1&page=1&sparkline=false`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`CoinGecko API returned ${response.status}`);
            }
            const coins = await response.json();
            if (coins.length > 0) {
                basePrice = coins[0].current_price;
                // Also update cache
                if (!priceCache.data) priceCache.data = {};
                priceCache.data[coin] = {
                    id: coins[0].id,
                    current_price: coins[0].current_price,
                };
                priceCache.timestamp = now;
            } else {
                throw new Error("No coin data returned");
            }
        }

        // Generate a hash from the date to get deterministic but varied predictions
        let hash = 0;
        const seed = date + coin;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash;
        }
        hash = Math.abs(hash);

        // Calculate days from today for trend factor
        const today = new Date();
        const targetDate = new Date(date);
        const daysDiff = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

        // Volatility: ETH is more volatile
        const volatilityBase = coin === "BTC" ? 0.03 : 0.05;
        const trendFactor = daysDiff * 0.0005; // slight upward trend for future dates

        const factor = ((hash % 100) / 100) * volatilityBase * 2 - volatilityBase + trendFactor;

        const predictedCurrent = basePrice * (1 + factor);
        const predictedHigh = predictedCurrent * (1 + ((hash % 50) / 1000) + 0.015);
        const predictedLow = predictedCurrent * (1 - ((hash % 40) / 1000) - 0.015);
        const predictedOpen = predictedCurrent * (1 + (((hash % 20) - 10) / 1000));

        return res.status(200).json({
            coin,
            date,
            basePrice: basePrice.toFixed(2),
            prediction: {
                open: predictedOpen.toFixed(2),
                high: predictedHigh.toFixed(2),
                low: predictedLow.toFixed(2),
                current: predictedCurrent.toFixed(2),
            },
        });
    } catch (error) {
        console.error("predict error:", error.message);
        return res.status(502).json({ message: "Failed to generate prediction. Try again later." });
    }
};

module.exports = { getPrices, getHistory, predict };
