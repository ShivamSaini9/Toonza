import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Frontend gate is purely UX (hides the panel from people who can't use it).
// The real enforcement lives server-side in requireAdmin middleware, so even
// if someone bypasses this component, /api/v1/admin/* still rejects them.
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  return children;
};

export default AdminRoute;
