"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  login as clientLogin,
  logout as clientLogout,
  getCurrentUser,
} from "../../lib/auth";
import { AuthState, User } from "../../types/auth";

// Create the auth context
const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  authState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  },
  login: async () => {},
  logout: async () => {},
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
      await clientLogin(email, password);
      // Refetch the current user after login
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/dashboard"); // Redirect to dashboard after login
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await clientLogout();
      // Clear the user from the cache
      queryClient.setQueryData(["currentUser"], null);
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
