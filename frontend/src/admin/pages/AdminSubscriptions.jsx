import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin";

const PLAN_PRICE = { Starter: 5, Pro: 15 };

const AdminSubscriptions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminApi.getTransactions({ page, limit: 20 });
        setTransactions(res.data.data.transactions);
        setTotalPages(res.data.data.totalPages);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Subscriptions & Payments</h1>
      <p className="text-sm text-slate-400 mb-6">Every completed Stripe transaction.</p>

      <div className="rounded-2xl border border-amber-500/15 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Credits</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Loading…</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No transactions yet.</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">
                    {t.user?.fullName || "Deleted user"}
                    <div className="text-xs text-slate-500">{t.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{t.plan}</td>
                  <td className="px-4 py-3 text-slate-300">{t.credits}</td>
                  <td className="px-4 py-3 text-emerald-400">${(PLAN_PRICE[t.plan] || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm text-slate-400">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded-lg bg-white/5 disabled:opacity-30">
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-lg bg-white/5 disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
