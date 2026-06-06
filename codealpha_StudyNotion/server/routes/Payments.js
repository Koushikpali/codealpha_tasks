// Import the required modules
const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  verifyPayment, // Stripe webhook handler
  verifySession, // Frontend verify handler
  sendPaymentSuccessEmail,
} = require("../controllers/payment");

const { auth, isStudent } = require("../middlewares/auth");

// ---------------------------------------------
// 🟢 1. Stripe Webhook (Stripe → Server)
// ---------------------------------------------
// ⚠️ Must use express.raw(), NOT express.json()
// ⚠️ Do NOT put "auth" middleware here
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  verifyPayment
);

// ---------------------------------------------
// 🟢 2. Capture Payment (Frontend → Server)
// ---------------------------------------------
router.post("/capturePayment", auth, isStudent, createCheckoutSession);

// ---------------------------------------------
// 🟢 3. Verify Payment After Return (Frontend → Server)
// ---------------------------------------------
router.post("/verifySession", auth, isStudent, verifySession);

// ---------------------------------------------
// 🟢 4. Send Payment Success Email (Optional)
// ---------------------------------------------
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  sendPaymentSuccessEmail
);

// ---------------------------------------------
// Export the router
// ---------------------------------------------
module.exports = router;


















// const express = require("express");
// const router = express.Router();

// const {
//   createCheckoutSession,
//   verifyPayment,
//   sendPaymentSuccessEmail,
// } = require("../controllers/payment");

// const { auth, isStudent } = require("../middlewares/auth");

// // 1️⃣ Create Stripe checkout session (called from frontend)
// router.post("/create-checkout-session", auth, isStudent, createCheckoutSession);

// // 2️⃣ Stripe webhook to verify payment (called by Stripe, not frontend)
// router.post(
//   "/verify-payment",
//   express.raw({ type: "application/json" }),
//   verifyPayment
// );

// // 3️⃣ Send payment success email manually (optional, for testing)
// router.post(
//   "/send-payment-success-email",
//   auth,
//   isStudent,
//   sendPaymentSuccessEmail
// );

// module.exports = router;
