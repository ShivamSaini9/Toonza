import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Gem, LogIn } from "lucide-react";

const Navbar = ({ onMenuClick = () => {} }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="
      sticky top-0 z-50 h-16
      bg-[#020617]/80 backdrop-blur-xl
      border-b border-white/10
      flex items-center justify-between
      px-4 sm:px-8
    "
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/80 hover:text-white transition"
        >
          ☰
        </button>

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex cursor-pointer items-center gap-2.5"
        >
          <img
            src="/logo.png"
            alt="Toonza logo"
            className="h-10 w-10 object-contain"
            width="40"
            height="40"
          />
          <span className="hidden font-serif text-lg font-bold tracking-[0.16em] text-white sm:inline">
            TOONZA
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {user ? (
          <span className="hidden lg:inline text-sm text-slate-300">
            Welcome, <span className="text-white">{user.fullName}</span>
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/app/pricing")}
              className="
              flex items-center gap-2
              rounded-full px-4 py-2
              bg-white/5 backdrop-blur
              border border-white/10
              text-sm text-slate-300
              hover:text-white hover:border-violet-500/40 transition
            "
            >
              <Gem size={16} />
              <span className="hidden sm:inline">Pricing</span>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="
              flex items-center gap-2
              rounded-full px-4 py-2
              bg-white/5 backdrop-blur
              border border-white/10
              text-sm text-slate-300
              hover:text-white hover:border-violet-500/40 transition
            "
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
