import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!sessionId) return;

    api
      .post("/api/v1/payment/verify", { session_id: sessionId })
      .then(async (response) => {
        await refreshUser();
        toast.success(response.data.message || "Payment verified 🎉");
      })
      .catch(() => toast.error("Payment verification failed"));
  }, [sessionId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white"
    >
      <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
      <h1 className="text-4xl font-bold mb-2">Payment Successful 🎉</h1>
      <p className="text-slate-400">
        Your credits are being added to your account.
      </p>
      <button
        onClick={() => navigate("/home")}
        className="mt-4 px-6 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
      >
        Back to Home
      </button>
    </motion.div>
  );
};

export default PaymentSuccess;
