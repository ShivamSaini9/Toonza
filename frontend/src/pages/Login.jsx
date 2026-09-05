import { createElement, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

const InputField = ({
  icon,
  type,
  name,
  onChange,
  value,
  placeholder,
  showPassword,
  onTogglePassword,
}) => (
  <div
    className="
      group flex items-center gap-3
      rounded-xl px-4 py-3
      bg-black/40 backdrop-blur
      border border-white/10
      focus-within:border-violet-500/50
      transition
    "
  >
    {createElement(icon, {
      className:
        "w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition",
    })}
    <input
      type={showPassword ? "text" : type}
      name={name}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      required
      className="bg-transparent outline-none flex-1 text-white placeholder-slate-500"
    />
    {type === "password" && (
      <button
        type="button"
        onClick={onTogglePassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"}
        className="text-slate-400 transition hover:text-white"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    )}
  </div>
);

const Button = ({ children, disabled }) => (
  <button
    disabled={disabled}
    className="
      w-full flex items-center justify-center gap-2
      rounded-xl py-3 font-medium
      bg-gradient-to-r from-violet-600 to-cyan-500
      text-white
      disabled:opacity-60
      shadow-lg shadow-violet-500/30
      transition
    "
  >
    {children}
  </button>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const from = sessionStorage.getItem("redirectAfterLogin") || "/app/home";
      await login(formData);
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#020617] text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-cyan-500/5 to-transparent" />

      <div className="flex justify-center relative z-10 px-6 py-10">
        {/* Card */}
        <div
          className="
           p-8
            bg-white/5 backdrop-blur-xl
            shadow-xl shadow-black/40
            w-full max-w-md
          "
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Continue creating with AI</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={Mail}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
            />

            <InputField
              icon={Lock}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((visible) => !visible)}
            />

            <div className="flex justify-between items-center text-sm text-slate-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-violet-500" />
                Remember me
              </label>
              <button
                type="button"
                className="hover:text-violet-400 transition"
              >
                Forgot password?
              </button>
            </div>

            <Button disabled={loading}>
              <LogIn size={16} />
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Don’t have an account?{" "}
            <Link to="/register" className="text-violet-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        {/* Image (Hidden on mobile) */}
        <div className="hidden lg:block">
          <img
            src="login-1.webp"
            alt="Login illustration"
            className=" max-w-full select-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
