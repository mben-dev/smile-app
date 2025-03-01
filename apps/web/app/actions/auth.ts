"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginResponse, User } from "../../types/auth";

const API_URL = process.env.API_URL || "http://localhost:3333";
const AUTH_TOKEN_KEY = "auth_token";

export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    console.log(`Attempting to login with API URL: ${API_URL}`);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(`Login response status: ${response.status}`);

    const responseData = await response.json();
    console.log(`Login response data:`, responseData);

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || "Invalid credentials",
      };
    }

    const data: LoginResponse = responseData;

    // Set the auth token in a cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_TOKEN_KEY, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "strict",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An error occurred during login. Please try again.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  if (token) {
    try {
      // Call the logout endpoint
      await fetch(`${API_URL}/auth/logout`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Always delete the cookie
  cookieStore.delete(AUTH_TOKEN_KEY);

  // Redirect to login page
  redirect("/login");
}

export async function getCurrentUserAction(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
