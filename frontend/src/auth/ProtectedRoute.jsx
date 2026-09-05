import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    sessionStorage.setItem(
      "redirectAfterLogin",
      `${location.pathname}${location.search}`,
    );
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
