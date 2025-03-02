import Cookies from "js-cookie";
// import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/auth";
import api from "./api";

const AUTH_TOKEN_KEY = "auth_token";
// const TOKEN_EXPIRY_DAYS = 1; // 1 day

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const router = useRouter();

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return false;
      }

      const response = await api.get("/auth/me");
      setUser(response.data);
      setLoading(false);
      return true;
    } catch {
      localStorage.removeItem("auth_token");
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token } = response.data;
    localStorage.setItem("auth_token", token);

    // Récupérer les informations de l'utilisateur
    const userResponse = await api.get("/auth/me");
    setUser(userResponse.data);
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("getCurrentUser called");
    const token = Cookies.get(AUTH_TOKEN_KEY);
    console.log("Token from cookies:", token ? "Token exists" : "No token");

    if (!token) {
      console.log("No token found, returning null");
      return null;
    }

    console.log("Fetching user data from API");
    const response = await api.get<User>("/auth/me");
    console.log("User data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export function getToken(): string | null {
  return Cookies.get(AUTH_TOKEN_KEY) || null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
