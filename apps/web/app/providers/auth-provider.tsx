"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getCurrentUser } from "lib/auth";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../../lib/api";
import { AuthState, User } from "../../types/auth";

// Create the auth context
const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}>({
  authState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  },
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Use React Query to fetch the current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  // Update auth state when user data changes
  useEffect(() => {
    console.log("Auth state update - User data changed:", user);
    setAuthState({
      user: user || null,
      token: null, // We don't expose the token in the client
      isAuthenticated: !!user,
      isLoading,
    });
  }, [user, isLoading]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Login function called");
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;
      console.log("Login successful, token received");

      // Utiliser Cookies au lieu de localStorage
      Cookies.set("auth_token", token, { expires: 1 }); // Expire dans 1 jour

      // Refetch the current user after login
      console.log("Invalidating currentUser query");
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      console.log("Query invalidated, waiting for refetch");

      // Force a refetch to ensure we have the latest user data
      await queryClient.refetchQueries({ queryKey: ["currentUser"] });
      console.log("Refetch completed");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.get("/auth/logout");

      // Utiliser Cookies au lieu de localStorage
      Cookies.remove("auth_token");

      // Clear the user from the cache
      queryClient.setQueryData(["currentUser"], null);
      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Function to check authentication status and refresh user data
  const checkAuth = async () => {
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
