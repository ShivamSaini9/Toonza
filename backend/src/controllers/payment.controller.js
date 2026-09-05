import mongoose from "mongoose";
import stripe from "../config/stripe.js";
import { User } from "../models/user.model.js";
import { PaymentTransaction } from "../models/paymentTransaction.model.js";
import { ApiError } from "../utils/ApiError.js";

const plans = {
  Starter: { price: 500, credits: 100 },
  Pro: { price: 1500, credits: 500 },
};

const createCheckoutSession = async (req, res) => {
  const { plan } = req.body;
  const user = req.user;
  const selectedPlan = plans[plan];

  if (!user) throw new ApiError(401, "User is not logged in");
  if (!selectedPlan) throw new ApiError(400, "Invalid plan");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `${plan} Plan - ${selectedPlan.credits} Credits` },
        unit_amount: selectedPlan.price,
      },
      quantity: 1,
    }],
    metadata: {
      userId: user._id.toString(),
      credits: selectedPlan.credits,
      plan,
    },
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
  });

  return res.json({ url: session.url });
};

const fulfillPayment = async (session) => {
  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits);
  const plan = session.metadata?.plan;

  if (!userId || !credits || !plan) throw new ApiError(400, "Invalid payment metadata");

  const mongoSession = await mongoose.startSession();
  try {
    mongoSession.startTransaction();

    await PaymentTransaction.create([{
      sessionId: session.id,
      user: userId,
      credits,
      plan,
    }], { session: mongoSession });

    await User.findByIdAndUpdate(
      userId,
      { $inc: { credits }, $set: { plan } },
      { session: mongoSession },
    );

    await mongoSession.commitTransaction();
    return { processed: true, credits };
  } catch (error) {
    await mongoSession.abortTransaction();
    if (error?.code === 11000) return { processed: false, credits: 0 };
    throw error;
  } finally {
    await mongoSession.endSession();
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    try {
      await fulfillPayment(event.data.object);
    } catch (error) {
      console.error("Stripe fulfillment failed:", error);
      return res.status(500).json({ received: false });
    }
  }

  return res.json({ received: true });
};

const verifyPaymentAndAddCredits = async (req, res) => {
  const { session_id: sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: "Session ID required" });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return res.status(400).json({ message: "Payment not completed" });
  }

  if (session.metadata?.userId !== req.user._id.toString()) {
    return res.status(403).json({ message: "Payment does not belong to this user" });
  }

  // The webhook is the source of truth. This endpoint is intentionally idempotent
  // and also fulfills the payment if the webhook has not arrived yet.
  const result = await fulfillPayment(session);
  return res.json({
    message: result.processed ? "Payment verified and credits added 🎉" : "Payment already processed",
    creditsAdded: result.credits,
  });
};

export { createCheckoutSession, stripeWebhook, verifyPaymentAndAddCredits };
