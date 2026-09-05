import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user) {
    return <Navigate to="/app/home" replace />;
  }

  return children;
};

export default PublicRoute;
