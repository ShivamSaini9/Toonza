import {
  LayoutDashboard,
  Users,
  CreditCard,
  Library,
  MessageSquare,
  ArrowLeftCircle,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/assets", label: "Creator Assets", icon: Library },
  { to: "/admin/community", label: "Community", icon: MessageSquare },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/home", { replace: true });
  };

  return (
    <aside
      className="
      sticky top-0 h-screen w-64 shrink-0
      bg-[#0b0605]/95 backdrop-blur-xl
      border-r border-amber-500/15
      p-4 flex flex-col justify-between
    "
    >
      <div>
        <div className="flex items-center gap-2 mb-1 text-xl font-bold text-white">
          <img
            src="/logo.png"
            alt="Toonza logo"
            className="h-8 w-8 object-contain"
            width="32"
            height="32"
          />
          <span>Toonza</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-amber-500/70 mb-6 pl-1">
          Admin Console
        </p>

        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2 rounded-xl transition text-sm
                ${isActive ? "bg-amber-500/10 text-amber-300" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
              }
            >
              {({ isActive }) =>
                isActive ? (
                  <>
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-400" />
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </>
                ) : (
                  <>
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </>
                )
              }
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        {user && (
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300">
            Signed in as
            <div className="text-white font-medium truncate">
              {user.fullName}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/app/home")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
          bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm transition"
        >
          <ArrowLeftCircle className="w-4 h-4" />
          Back to Member App
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
          bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
