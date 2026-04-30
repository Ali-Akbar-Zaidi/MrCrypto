const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");
const authMiddleware = require("../middleware/auth-middleware");
const validate = require("../middleware/validate-middleware");
const {
    signUpSchema,
    loginSchema,
    updateProfileSchema,
    tradeSchema,
    forgotCredentialsSchema,
} = require("../validators/auth-validator");

// Public routes
router.route("/signUp").post(validate(signUpSchema), authControllers.signUp);
router.route("/login").post(validate(loginSchema), authControllers.login);
router.route("/forgotCredentials").post(validate(forgotCredentialsSchema), authControllers.forgotCredentials);

// Protected routes (require JWT)
router.route("/profile").get(authMiddleware, authControllers.getProfile);
router.route("/updateProfile").put(authMiddleware, validate(updateProfileSchema), authControllers.updateProfile);
router.route("/trade").put(authMiddleware, validate(tradeSchema), authControllers.trade);

module.exports = router;