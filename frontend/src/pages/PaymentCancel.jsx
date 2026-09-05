import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white"
    >
      <XCircle className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-4xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-slate-400">You were not charged. Try again anytime.</p>
      <button
        onClick={() => navigate("/app/pricing")}
        className="mt-4 px-6 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
      >
        Go Back to Plans
      </button>
    </motion.div>
  );
};

export default PaymentCancel;
