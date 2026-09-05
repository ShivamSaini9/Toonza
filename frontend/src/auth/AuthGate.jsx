import { useAuth } from "../auth/AuthContext";

const AuthGate = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div
          className="animate-spin h-8 w-8 rounded-full
          border-2 border-slate-600 border-t-indigo-500"
        />
      </div>
    );
  }

  return children;
};

export default AuthGate;
