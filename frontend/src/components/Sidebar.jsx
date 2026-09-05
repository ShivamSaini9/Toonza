import {
  CircleDollarSign,
  Image,
  FileText,
  LogIn,
  UserPlus,
  Mic,
  LayoutDashboard,
  Wand2,
  Library,
  ShieldAlert,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createElement, useEffect } from "react";

const SidebarButton = ({ icon, label, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer
      transition text-slate-300 hover:bg-white/5
      ${isActive ? "bg-white/10 text-white" : ""}`}
  >
    {isActive && (
      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-violet-500 to-cyan-400" />
    )}
    {createElement(icon, { className: "w-5 h-5" })}
    <span className="text-sm">{label}</span>
  </div>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { credits, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
    navigate("/home", { replace: true });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed lg:sticky top-16 left-0 z-50
        h-[calc(100vh-64px)]
        w-64 lg:w-60
        bg-[#020617]/90 backdrop-blur-xl
        border-r border-white/10
        p-4 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div>
          {/* MOBILE CLOSE */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={onClose}
              className="lg:hidden text-white/60 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          {/* MOBILE USER INFO */}
          {user && (
            <div className="lg:hidden mb-6 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300">
              Logged in as
              <div className="text-white font-medium truncate">
                {user.fullName}
              </div>
            </div>
          )}

          {/* NAV */}
          <nav className="space-y-1">
            <SidebarButton
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() => navigate("/app/home")}
              isActive={location.pathname === "/app/home"}
            />

            <SidebarButton
              icon={Image}
              label="Image Generation"
              onClick={() => navigate("/app/image-generation")}
              isActive={location.pathname === "/app/image-generation"}
            />

            <SidebarButton
              icon={FileText}
              label="Image Enhancer"
              onClick={() => navigate("/app/image-enhancer")}
              isActive={location.pathname === "/app/image-enhancer"}
            />

            <SidebarButton
              icon={Mic}
              label="Text to Voice"
              onClick={() => navigate("/app/voice-generation")}
              isActive={location.pathname === "/app/voice-generation"}
            />

            {/* Creator Tools */}
            {user && (
              <div className="pt-4 pb-1 px-3 text-xs uppercase tracking-widest text-slate-500">
                Creator Tools
              </div>
            )}

            <SidebarButton
              icon={Wand2}
              label="Dialogue Separator"
              onClick={() => navigate("/app/dialogue-separator")}
              isActive={location.pathname === "/app/dialogue-separator"}
            />

            <SidebarButton
              icon={Library}
              label="Asset Library"
              onClick={() => navigate("/app/asset-library")}
              isActive={location.pathname === "/app/asset-library"}
            />
          </nav>
        </div>

        {/* BOTTOM */}
        {user ? (
          <div className="space-y-2">
            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-1.5
                bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition text-xs"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Admin Panel
              </button>
            )}

            {/* CREDITS */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <CircleDollarSign className="h-4 w-4 text-cyan-400" />
                  <span>{credits} credits</span>
                </div>
                <button
                  onClick={() => navigate("/app/pricing")}
                  className="rounded-lg px-2.5 py-1 text-xs
                  bg-gradient-to-r from-violet-600 to-cyan-500
                  hover:opacity-90 text-white
                "
                >
                  Upgrade
                </button>
              </div>
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl
              px-3 py-1.5 text-sm
              bg-red-500/10 hover:bg-red-500/20
              text-red-400 border border-red-500/20
            "
            >
              <UserPlus className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => navigate("/login")}
              className="
              w-full flex items-center justify-center gap-2
              rounded-full px-4 py-2
              bg-white/5 backdrop-blur
              border border-white/10
              text-sm text-slate-300
              hover:text-white hover:border-violet-500/40 transition
            "
            >
              <LogIn size={16} />
              Sign In
            </button>

            <button
              onClick={() => navigate("/register")}
              className="
              w-full flex items-center justify-center gap-2
              rounded-full px-4 py-2
              bg-gradient-to-r from-violet-600 to-cyan-500
              hover:opacity-90 text-white
            "
            >
              <UserPlus size={16} />
              Sign Up
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
