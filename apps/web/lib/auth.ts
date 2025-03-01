import Cookies from "js-cookie";
import { LoginResponse, User } from "../types/auth";
import api from "./api";

const AUTH_TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_DAYS = 1; // 1 day

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    const { token, expiresAt } = response.data;

    // Store the token in a cookie
    Cookies.set(AUTH_TOKEN_KEY, token, {
      expires: TOKEN_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    // Call the logout endpoint
    await api.get("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always remove the token, even if the API call fails
    Cookies.remove(AUTH_TOKEN_KEY);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) {
      return null;
    }

    const response = await api.get<User>("/auth/me");
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
