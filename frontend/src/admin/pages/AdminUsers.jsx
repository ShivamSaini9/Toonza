import { useEffect, useState, useCallback } from "react";
import { Search, Ban, CheckCircle2, ShieldPlus, ShieldMinus, Coins } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin";
import { useAuth } from "../../auth/AuthContext";

const AdminUsers = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creditDrafts, setCreditDrafts] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search, page, limit: 15 });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.totalPages);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300); // debounce search typing
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const toggleSuspend = async (u) => {
    try {
      const res = await adminApi.setSuspension(u._id, !u.isSuspended);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.data : x)));
      toast.success(u.isSuspended ? "User activated" : "User suspended");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    }
  };

  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "member" : "admin";
    if (!window.confirm(`Change ${u.fullName}'s role to "${newRole}"?`)) return;
    try {
      const res = await adminApi.updateRole(u._id, newRole);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.data : x)));
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    }
  };

  const applyCredits = async (u) => {
    const value = Number(creditDrafts[u._id]);
    if (Number.isNaN(value)) return toast.error("Enter a valid number");
    try {
      const res = await adminApi.updateCredits(u._id, value, "set");
      setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.data : x)));
      setCreditDrafts((d) => ({ ...d, [u._id]: "" }));
      toast.success("Credits updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-sm text-slate-400 mb-6">Search, suspend, and manage member credits.</p>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/40"
        />
      </div>

      <div className="rounded-2xl border border-amber-500/15 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Credits</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        u.role === "admin" ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-slate-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white">{u.credits}</span>
                      <input
                        type="number"
                        placeholder="set…"
                        value={creditDrafts[u._id] ?? ""}
                        onChange={(e) => setCreditDrafts((d) => ({ ...d, [u._id]: e.target.value }))}
                        className="w-16 px-1.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                      />
                      <button
                        onClick={() => applyCredits(u)}
                        title="Apply credit change"
                        className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                      >
                        <Coins className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.isSuspended ? (
                      <span className="text-red-400 text-xs">Suspended</span>
                    ) : (
                      <span className="text-emerald-400 text-xs">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleSuspend(u)}
                        disabled={u._id === me?._id}
                        title={u.isSuspended ? "Activate" : "Suspend"}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                      >
                        {u.isSuspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={u._id === me?._id}
                        title={u.role === "admin" ? "Demote to member" : "Promote to admin"}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                      >
                        {u.role === "admin" ? <ShieldMinus className="w-4 h-4" /> : <ShieldPlus className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm text-slate-400">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded-lg bg-white/5 disabled:opacity-30"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg bg-white/5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
