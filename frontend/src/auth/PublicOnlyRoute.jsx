import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();

  // If logged in → redirect to app
  if (user) {
    return <Navigate to="/app/home" replace />;
  }

  // If NOT logged in → allow
  return children;
};

export default PublicOnlyRoute;
