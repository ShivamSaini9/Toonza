import { Sparkles, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

const plans = [
  {
    name: "Free",
    price: "$0",
    credits: "10 Credits",
    description: "Perfect to explore the platform",
    features: [
      "10 free credits",
      "Image enhancer",
      "Text to image",
      "Standard quality",
    ],
    buttonText: "Current Plan",
    disabled: true,
  },
  {
    name: "Starter",
    price: "$5",
    credits: "100 Credits",
    description: "For casual creators",
    features: [
      "100 credits",
      "All AI tools",
      "Faster processing",
      "No watermark",
    ],
    buttonText: "Buy Starter",
    priceId: "price_1Sp192AaW7IBLYJVjvXLi3rm",
  },
  {
    name: "Pro",
    price: "$15",
    credits: "500 Credits",
    description: "Built for professionals",
    features: [
      "500 credits",
      "All AI tools",
      "Priority processing",
      "No watermark",
      "Commercial usage",
    ],
    buttonText: "Buy Pro",
    highlight: true,
    priceId: "price_1Sp19eAaW7IBLYJV3zEsNh1C",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePurchase = async (planName) => {
    if (!user?._id) {
      navigate("/login");
    }
    const res = await api.post("/api/v1/payment/create-checkout", {
      plan: planName,
    });
    window.location.href = res.data.url;
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white px-6 py-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-cyan-500/5 to-transparent" />

      {/* Back Button */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2
        rounded-full px-4 py-2
        bg-white/5 backdrop-blur
        border border-white/10
        text-sm text-slate-300
        hover:text-white hover:border-violet-500/40 transition"
      >
        <ArrowLeft size={16} />
        Home
      </button>
      {/* <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 flex items-center gap-2
        rounded-full px-4 py-2
        bg-white/5 backdrop-blur
        border border-white/10
        text-sm text-slate-300
        hover:text-white hover:border-violet-500/40 transition"
      >
        <ArrowLeft size={16} />
        Home
      </button> */}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center items-center gap-2 text-4xl md:text-5xl font-bold">
            <Sparkles className="text-violet-400" />
            Simple, Credit-Based Pricing
          </div>

          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Buy credits once and use them across all AI tools. No subscriptions.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative rounded-2xl p-8
              backdrop-blur-xl border transition
              ${
                plan.highlight
                  ? "bg-white/10 border-violet-500/40 shadow-xl shadow-violet-500/20"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 right-6 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs px-3 py-1 rounded-full shadow">
                  Most Popular
                </span>
              )}

              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-slate-400 mb-5">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-slate-400 ml-2">one-time</span>
              </div>

              <div className="mb-6 text-cyan-400 font-medium">
                {plan.credits}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-slate-300"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={plan.disabled}
                onClick={() => handlePurchase(plan.name)}
                className={`w-full py-3 rounded-xl font-semibold transition
                ${
                  plan.disabled
                    ? "bg-slate-700 cursor-not-allowed"
                    : plan.highlight
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90"
                    : "from-violet-600 to-cyan-500 bg-gradient-to-r hover:opacity-90"
                }`}
              >
                {plan.buttonText}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 mt-14">
          Credits never expire. Use them anytime.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
