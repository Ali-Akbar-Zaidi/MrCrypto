import React, { createContext, useContext, useState, useCallback } from "react";

// Use the same port the server is running on — change here if your .env PORT changes
const API_URL = "http://localhost:5002/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    // Only token and username are stored in localStorage (for session persistence across refresh)
    const [user, setUser] = useState(() => localStorage.getItem("user") || null);
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // ── Helper: get auth headers ─────────────────────────────────────────────
    const getHeaders = useCallback(() => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    }), []);

    // ── Sign Up (saves user to MongoDB) ───────────────────────────────────────
    const signUp = useCallback(async ({ username, email, password }) => {
        try {
            const res = await fetch(`${API_URL}/auth/signUp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = data.errors
                    ? data.errors.map((e) => e.message).join(", ")
                    : data.message || "Sign up failed";
                return { success: false, message: msg };
            }

            return { success: true };
        } catch (error) {
            console.error("signUp error:", error);
            return { success: false, message: "Network error. Is the server running?" };
        }
    }, []);

    // ── Login (authenticates against MongoDB) ─────────────────────────────────
    const login = useCallback(async ({ username, password }) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = data.errors
                    ? data.errors.map((e) => e.message).join(", ")
                    : data.message || "Login failed";
                return { success: false, message: msg };
            }

            // Only store token and username in localStorage for session
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", data.user);

            setUser(data.user);
            setToken(data.token);
            return { success: true };
        } catch (error) {
            console.error("login error:", error);
            return { success: false, message: "Network error. Is the server running?" };
        }
    }, []);

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
    }, []);

    // ── Get Profile (all data from MongoDB) ──────────────────────────────────
    const getProfile = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: "GET",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, message: data.message };

            return { success: true, data };
        } catch (error) {
            console.error("getProfile error:", error);
            return { success: false, message: "Network error" };
        }
    }, [getHeaders]);

    // ── Update Profile (updates MongoDB) ──────────────────────────────────────
    const updateProfile = useCallback(async ({ username, email, password }) => {
        try {
            const body = {};
            if (username) body.username = username;
            if (email) body.email = email;
            if (password) body.password = password;

            const res = await fetch(`${API_URL}/auth/updateProfile`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = data.errors
                    ? data.errors.map((e) => e.message).join(", ")
                    : data.message || "Update failed";
                return { success: false, message: msg };
            }

            // Sync the display name in localStorage
            if (data.username) {
                localStorage.setItem("user", data.username);
                setUser(data.username);
            }

            return { success: true };
        } catch (error) {
            console.error("updateProfile error:", error);
            return { success: false, message: "Network error" };
        }
    }, [getHeaders]);

    // ── Trade (persists to MongoDB) ──────────────────────────────────────────
    const executeTrade = useCallback(async ({ currency, quantity, cardNumber, cvc, expiryDate }) => {
        try {
            const res = await fetch(`${API_URL}/auth/trade`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({
                    currency,
                    quantity: parseFloat(quantity),
                    cardNumber,
                    cvc,
                    expiryDate,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = data.errors
                    ? data.errors.map((e) => e.message).join(", ")
                    : data.message || "Trade failed";
                return { success: false, message: msg };
            }

            return { success: true, data };
        } catch (error) {
            console.error("executeTrade error:", error);
            return { success: false, message: "Network error" };
        }
    }, [getHeaders]);

    // ── Forgot Password (reads from MongoDB) ─────────────────────────────────
    const getPasswordByCredentials = useCallback(async ({ username, email }) => {
        try {
            const res = await fetch(`${API_URL}/auth/forgotCredentials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email }),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = data.errors
                    ? data.errors.map((e) => e.message).join(", ")
                    : data.message || "Recovery failed";
                return { success: false, message: msg };
            }

            return {
                success: true,
                message: data.message,
                password: data.password || null,
            };
        } catch (error) {
            console.error("forgotCredentials error:", error);
            return { success: false, message: "Network error" };
        }
    }, []);

    // ── Fetch Crypto Prices (from CoinGecko via server) ──────────────────────
    const getCryptoPrices = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/crypto/prices`);
            const data = await res.json();
            if (!res.ok) return { success: false, message: data.message };
            return { success: true, data };
        } catch (error) {
            console.error("getCryptoPrices error:", error);
            return { success: false, message: "Network error" };
        }
    }, []);

    // ── Predict Price (via server + CoinGecko) ───────────────────────────────
    const predictPrice = useCallback(async ({ coin, date }) => {
        try {
            const res = await fetch(`${API_URL}/crypto/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ coin, date }),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, message: data.message };
            return { success: true, data };
        } catch (error) {
            console.error("predictPrice error:", error);
            return { success: false, message: "Network error" };
        }
    }, []);

    const isLoggedIn = !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn,
                signUp,
                login,
                logout,
                getProfile,
                updateProfile,
                executeTrade,
                getPasswordByCredentials,
                getCryptoPrices,
                predictPrice,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };