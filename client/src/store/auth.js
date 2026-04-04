import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => localStorage.getItem("user") || null);
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
    const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));

    // ── Sign Up ───────────────────────────────────────────────────────────────
    const signUp = useCallback(({ username, email, password }) => {
        const users = getUsers();
        const exists = users.find(
            (u) => u.username === username || u.email === email
        );
        if (exists) return { success: false, message: "Username or Email already exists!" };

        const newUser = {
            userId: Date.now().toString(),
            username,
            email,
            password,
            btc: "0",
            eth: "0",
        };
        saveUsers([...users, newUser]);
        return { success: true };
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(({ username, password }) => {
        const users = getUsers();
        const found = users.find(
            (u) => u.username === username && u.password === password
        );
        if (!found) return { success: false, message: "Incorrect credentials!" };

        // Create a simple session token
        const sessionToken = btoa(`${found.userId}:${Date.now()}`);
        localStorage.setItem("token", sessionToken);
        localStorage.setItem("userId", found.userId);
        localStorage.setItem("user", found.username);
        localStorage.setItem("email", found.email);
        localStorage.setItem("password", found.password);
        localStorage.setItem("btc", found.btc);
        localStorage.setItem("eth", found.eth);

        setUser(found.username);
        setToken(sessionToken);
        return { success: true };
    }, []);

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.clear();
        setUser(null);
        setToken(null);
    }, []);

    // ── Update Profile ────────────────────────────────────────────────────────
    const updateProfile = useCallback(({ userId, username, email, password }) => {
        const users = getUsers();
        const idx = users.findIndex((u) => u.userId === userId);
        if (idx === -1) return { success: false, message: "User not found!" };

        // Check uniqueness (skip the current user)
        const duplicate = users.find(
            (u, i) => i !== idx && (u.username === username || u.email === email)
        );
        if (duplicate) return { success: false, message: "Username or Email already taken!" };

        users[idx] = { ...users[idx], username, email, password };
        saveUsers(users);

        localStorage.setItem("user", username);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        setUser(username);
        return { success: true };
    }, []);

    // ── Update Crypto Holdings ────────────────────────────────────────────────
    const updateHoldings = useCallback(({ btc, eth }) => {
        const userId = localStorage.getItem("userId");
        const users = getUsers();
        const idx = users.findIndex((u) => u.userId === userId);
        if (idx !== -1) {
            users[idx] = { ...users[idx], btc, eth };
            saveUsers(users);
        }
        localStorage.setItem("btc", btc);
        localStorage.setItem("eth", eth);
    }, []);

    // ── Forgot Password ───────────────────────────────────────────────────────
    const getPasswordByCredentials = useCallback(({ username, email }) => {
        const users = getUsers();
        const found = users.find(
            (u) => u.username === username && u.email === email
        );
        if (!found) return { success: false, message: "No account found with those credentials!" };
        return { success: true, password: found.password };
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
                updateProfile,
                updateHoldings,
                getPasswordByCredentials,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };