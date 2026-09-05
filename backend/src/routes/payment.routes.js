import { Router } from "express";
import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
  verifyPaymentAndAddCredits,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-checkout").post(verifyJWT, createCheckoutSession);
router
  .route("/stripe-webhook")
  .post(express.raw({ type: "application/json" }), stripeWebhook);
router.route("/verify").post(verifyJWT, verifyPaymentAndAddCredits);

export default router;
