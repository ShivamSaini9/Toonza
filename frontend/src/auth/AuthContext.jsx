import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // Runs once when app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/v1/users/current-user");
        console.log("Current user data:", res.data);
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    const res = await api.get("/api/v1/users/current-user");
    setUser(res.data.data);
    return res.data.data;
  };

  useEffect(() => {
    if (user?.credits !== undefined) {
      setCredits(user.credits);
    }
  }, [user]);

  const login = async (credentials) => {
    // setLoading(true);
    try {
      await api.post("/api/v1/users/login", credentials);

      const res = await api.get("/api/v1/users/current-user");
      setUser(res.data.data);
    } catch (error) {
      throw error; // 👈 VERY IMPORTANT
    }
    // finally {
    //   setLoading(false);
    // }
  };

  const logout = async () => {
    await api.post("/api/v1/users/logout");
    setUser(null);
  };

  console.log("AuthContext:", { user, loading });

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        setCredits,
        login,
        logout,
        refreshUser,
        loading,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
