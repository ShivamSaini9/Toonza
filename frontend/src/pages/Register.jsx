import { createElement, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { Mail, Lock, UserPlus, User, Upload, Eye, EyeOff } from "lucide-react";

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

/* 🔥 CUSTOM FILE INPUT (NO WHITE BG) */
const FileUpload = ({ label, onChange, required }) => (
  <label
    className="
      flex items-center justify-between
      rounded-xl px-4 py-3
      bg-black/40 backdrop-blur
      border border-white/10
      cursor-pointer
      hover:border-violet-500/50
      transition
    "
  >
    <div className="flex items-center gap-3 text-slate-400">
      <Upload className="w-5 h-5 text-violet-400" />
      <span className="text-sm">{label}</span>
    </div>
    <span className="text-xs text-slate-500">Choose file</span>

    <input
      type="file"
      onChange={onChange}
      required={required}
      className="hidden"
    />
  </label>
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

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (avatar) data.append("avatar", avatar);

    try {
      setLoading(true);
      const from = sessionStorage.getItem("redirectAfterLogin") || "/app/home";

      await api.post("/api/v1/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await login({
        email: formData.email,
        password: formData.password,
      });

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
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-slate-400 text-sm">
              Join the AI creation community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={User}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
            />

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

            <FileUpload
              label="Upload avatar (Optional)"
              onChange={(e) => setAvatar(e.target.files[0])}
            />

            <p className="text-xs text-slate-400">
              By signing up, you agree to our{" "}
              <span className="text-violet-400 hover:underline cursor-pointer">
                Terms & Conditions
              </span>
            </p>

            <Button disabled={loading}>
              <UserPlus size={16} />
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400 hover:underline">
              Login
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

export default Register;
