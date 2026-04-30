const { z } = require("zod");

const signUpSchema = z.object({
    username: z
        .string({ required_error: "Username is required" })
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters"),
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Please provide a valid email address"),
    password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be at most 100 characters"),
});

const loginSchema = z.object({
    username: z.string({ required_error: "Username is required" }).trim().min(1, "Username is required"),
    password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

const updateProfileSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .optional(),
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .optional(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be at most 100 characters")
        .optional(),
});

const tradeSchema = z.object({
    currency: z.enum(["BTC", "ETH"], { required_error: "Currency must be BTC or ETH" }),
    quantity: z
        .number({ required_error: "Quantity is required", invalid_type_error: "Quantity must be a number" })
        .positive("Quantity must be a positive number")
        .max(1000000, "Quantity is too large"),
    cardNumber: z
        .string({ required_error: "Card number is required" })
        .transform((val) => val.replace(/\s/g, ""))                    // strip spaces
        .refine((val) => /^\d+$/.test(val), "Card number must contain only digits")
        .refine((val) => val.length >= 13 && val.length <= 19, "Card number must be 13-19 digits")
        .refine((val) => {
            // Luhn algorithm
            let sum = 0;
            let alternate = false;
            for (let i = val.length - 1; i >= 0; i--) {
                let n = parseInt(val[i], 10);
                if (alternate) {
                    n *= 2;
                    if (n > 9) n -= 9;
                }
                sum += n;
                alternate = !alternate;
            }
            return sum % 10 === 0;
        }, "Invalid card number (failed Luhn check)"),
    cvc: z
        .string({ required_error: "CVC is required" })
        .refine((val) => /^\d+$/.test(val), "CVC must contain only digits")
        .refine((val) => val.length >= 3 && val.length <= 4, "CVC must be 3-4 digits"),
    expiryDate: z
        .string({ required_error: "Expiry date is required" })
        .min(1, "Expiry date is required")
        .refine((val) => /^\d{4}-\d{2}$/.test(val), "Expiry date must be in YYYY-MM format")
        .refine((val) => {
            const [year, month] = val.split("-").map(Number);
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            return year > currentYear || (year === currentYear && month >= currentMonth);
        }, "Card has expired"),
});

const forgotCredentialsSchema = z.object({
    username: z.string({ required_error: "Username is required" }).trim().min(1, "Username is required"),
    email: z.string({ required_error: "Email is required" }).trim().email("Please provide a valid email"),
});

module.exports = {
    signUpSchema,
    loginSchema,
    updateProfileSchema,
    tradeSchema,
    forgotCredentialsSchema,
};
