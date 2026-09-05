import { useEffect, useState } from "react";
import { Users, UserPlus, Activity, DollarSign, Ban, Coins, Library, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin";
import StatCard from "../components/StatCard";

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getOverview();
        setStats(res.data.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load overview");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading overview…</div>;
  }

  if (!stats) {
    return <div className="text-slate-400 text-sm">No data available.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
      <p className="text-sm text-slate-400 mb-6">Platform health at a glance.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={UserPlus} label="New Users (7d)" value={stats.newUsers7d} hint={`${stats.newUsersToday} today`} />
        <StatCard icon={Activity} label="Active Users (7d)" value={stats.activeUsers7d} />
        <StatCard icon={Ban} label="Suspended" value={stats.suspendedUsers} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} hint={`$${stats.revenue30d.toFixed(2)} last 30d`} />
        <StatCard icon={Coins} label="Credits Sold" value={stats.creditsSold} />
        <StatCard icon={Library} label="Creator Assets" value={stats.totalAssets} />
        <StatCard icon={MessageSquare} label="Community Posts" value={stats.totalCommunityPosts} />
      </div>
    </div>
  );
};

export default AdminOverview;
